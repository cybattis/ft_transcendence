import {
  Injectable,
  Inject,
  InternalServerErrorException, OnModuleInit, OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraSignupDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/Users.entity';
import { UserService } from 'src/user/user.service';
import { TokenData } from '../type/jwt.type';
import { MailService } from 'src/mail/mail.service';
import { GlobalService } from './global.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as process from 'process';
import {failure, Result, success} from "../utils/Error";
import {APIError} from "../utils/errors";
import {TypeCheckers} from "../utils/type-checkers";
import {UserCredentials} from "../type/user.type";

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timer;
  private static invalidTokens: string[] = [];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(async () => {
      await this.checkTokenInvalidationList();
    }, 60 * 1000);
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  async exchangeCodeForToken(code: string): Promise<IntraTokenDto> {
    const clientId = process.env['API_UID'];
    const clientSecret = process.env['JWT_SECRET'];
    const redirectUri = process.env['API_URL'];
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Missing environment variables');
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);
    body.append('code', code);
    body.append('redirect_uri', redirectUri);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body,
    });

    return await response.json();
  }

  async disconnectUser(token: string, id: number): Promise<void> {
    if (token)
      AuthService.invalidTokens.push(token);
    await this.userService.changeOnlineStatus(id, false);
  }

  async infoUser(token: IntraTokenDto): Promise<IntraSignupDto> {
    const meUrl = 'https://api.intra.42.fr/v2/me';
    const response = await fetch(meUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    return await response.json();
  }

  async intraSignin(user: UserCredentials)
    : Promise<Result<string, typeof APIError.UserNotFound | typeof APIError.CodeSend>>
  {
    const authActivated = await this.userService.authActivated(user.email);
    if (authActivated.isErr())
      return failure(authActivated.error);

    const isVerified = await this.userService.isVerified(user.email);
    if (isVerified.isErr())
      return failure(isVerified.error);

    if (authActivated.value == false && isVerified.value == true) {
      const update = await this.userService.changeOnlineStatus(user.id, true);
      if (update.isErr())
        return failure(update.error);

      const payload: TokenData = {
        email: user.email,
        id: user.id,
        nickname: user.nickname,
      };
      return success(await this.jwtService.signAsync(payload));
    }

    const code = await this.mailService.sendCodeConfirmation(user.email);
    await this.cacheManager.set(code, user.email, 600000);
    return failure(APIError.CodeSend);
  }

  async signin(user: SigninDto)
    : Promise<Result<string,
    typeof APIError.UserNotFound | typeof APIError.UserIsIntra
    | typeof APIError.InvalidPassword | typeof APIError.UserNotVerified>> {
    const foundUser = await this.userService.findUserAndGetCredential(
        user.email,
    );
    if (foundUser.isErr())
      return failure(foundUser.error);

    if (foundUser.value.isIntra)
      return failure(APIError.UserIsIntra);

    const isVerified = await this.userService.isVerified(user.email);
    if (isVerified.isErr() || isVerified.value == false)
      return failure(APIError.UserNotVerified);

    const authActivated = await this.userService.authActivated(user.email);
      try {
        if (authActivated.isOk() && authActivated.value === true) {
            if (await bcrypt.compare(user.password, foundUser.value.password)) {
              await this.mailService.sendCodeConfirmation(user.email);
              return success('code');
            }
        } else if (await bcrypt.compare(user.password, foundUser.value.password)) {
          const update = await this.userService.changeOnlineStatus(foundUser.value.id, true);
          if (update.isErr())
            return failure(update.error);

          const payload: TokenData = {
            email: user.email,
            id: foundUser.value.id,
            nickname: foundUser.value.nickname,
          };
          return success(await this.jwtService.signAsync(payload));
        }
      } catch (e) {
        return failure(APIError.InvalidPassword);
      }
      return failure(APIError.InvalidPassword);
  }

  async generateToken(id: number): Promise<Result<string, typeof APIError.UserNotFound>> {
    const result = await this.userService.findByID(id);
    if (result.isErr())
      return failure(result.error);

    const user = result.value;
    const payload: TokenData = {
      email: user.email,
      id: user.id,
      nickname: user.nickname,
    };
    return success(await this.jwtService.signAsync(payload));
  }

  async createUser(body: SignupDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);
    const user: User = new User();

    user.nickname = body.nickname;
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.password = hash;
    user.IsIntra = false;

    const newUser = await this.userRepository.save(user);
    await this.mailService.sendUserConfirmation(newUser);
    return;
  }

  async createUserIntra(body: IntraSignupDto)
    : Promise<Result<User, typeof APIError.InvalidIntraName>>
  {
    const user: User = new User();

    user.nickname = body.login;

    if (body.displayname) {
      const parts = body.displayname.split(' ');
      user.firstname = parts[0];
      user.lastname = parts[1];
    } else {
      return failure(APIError.InvalidIntraName);
    }

    user.email = body.email;
    user.IsIntra = true;
    user.isVerified = true;

    user.avatarUrl = body.image.link;

    return success(await this.userRepository.save(user));
  }

  async sendIntraToken(dataUser: IntraSignupDto): Promise<Result<string, typeof APIError.UserNotFound>> {
    const result = await this.userService.findByEmail(dataUser.email);
    if (result.isErr())
      return failure(result.error);

    const user = result.value;
    const update = await this.userService.updateUserVerifiedStatus(user.id);
    if (update.isErr())
      return failure(update.error);

    const payload: TokenData = { email: user.email, id: user.id, nickname: user.nickname };
    return success(await this.jwtService.signAsync(payload));
  }

  async update2fa(id: number): Promise<Result<string, typeof APIError.UserNotFound>> {
    const result = await this.userService.getUserEmail(id);
    if (result.isErr())
      return failure(result.error);

    const code = await this.mailService.sendCodeConfirmation(result.value);
    return success(code);
  }

  async checkCode(code: string, email: string): Promise<boolean> {
    for (let i = 1; i < GlobalService.emails.length; i++) {
      if (
        ((email && GlobalService.emails[i] === email) ||
          (!email &&
            GlobalService.emails[i] === (await this.cacheManager.get(code)))) &&
        GlobalService.codes[i] === code
      ) {
        await this.cacheManager.del(code);
        return true;
      }
    }
    return false;
  }

  async logUser(email: string): Promise<Result<string, typeof APIError.UserNotFound>> {
    const user = await this.userService.findByEmail(email);
    if (user.isErr())
      return failure(user.error);

    const result = await this.userService.changeOnlineStatus(user.value.id, true);
    if (result.isErr())
      return failure(result.error);

    const payload: TokenData = {
      email: email,
      id: user.value.id,
      nickname: user.value.nickname,
    };
    return success(await this.jwtService.signAsync(payload));
  }

  validateToken(token: string): Result<TokenData, false> {
    if (AuthService.invalidTokens.includes(token)) {
      console.log('LIST: invalid token: ', token);
      return failure(false);
    }

    try {
      const payload: TokenData = this.jwtService.verify<TokenData>(token);
      if (!TypeCheckers.isTokenData(payload)) {
        const index = AuthService.invalidTokens.indexOf(token, 0);
        if (index > -1) {
          AuthService.invalidTokens.splice(index, 1);
        }
        return failure(false);
      }
      return success(payload);
    } catch (e) {
      console.log('Error :', e);
      return failure(false);
    }
  }

  async checkTokenInvalidationList() {
    for (let i = 0; i < AuthService.invalidTokens.length; i++) {
      if (!TypeCheckers.isTokenData(this.jwtService.verify<TokenData>(AuthService.invalidTokens[i]))) {
        AuthService.invalidTokens.splice(i, 1);
      }
    }
  }
}
