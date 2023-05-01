import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntraTokenDto } from './dto/token.dto';
import { IntraUserDto } from './dto/auth.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserIntra } from './entity/userIntra.entity';
import { User } from '../auth/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(  
    @InjectRepository(UserIntra)
    private userIntraRepository: Repository<UserIntra>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    ) {}

  getCode(code :string): string{
    return code;
  }

  async exchangeCodeForToken(code: string): Promise<IntraTokenDto> {
    const clientId = 'u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4';
    const clientSecret = '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';
    const redirectUri = 'http://127.0.0.1:5400/auth/42';
    const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';

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

    const data: IntraTokenDto = await response.json();
    return data;
  }

  async infoUser(token: IntraTokenDto): Promise<IntraUserDto> {
    const meUrl = 'https://api.intra.42.fr/v2/me';
    const response = await fetch(meUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
        },
    });
    const data : IntraUserDto = await response.json();

    return data;
  }

  async signin(user: User, jwt: JwtService): Promise<any> {
    const foundUser = await this.userRepository.findOne({where: {email: user.email}});
    if (foundUser) {
        const password = foundUser.password;
        if (bcrypt.compare(user.password, password)) {
            const payload = { email: user.email };
            return {
                token: jwt.sign(payload),
            };
        }
        return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
    }
    return new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED)
}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUser(email: string, password: string): Promise<User | null> {
    return this.userRepository.findOne({where: {email, password}});
  }

  async createUser(body: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);
    const user: User = new User();

    user.nickname = body.nickname;
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.password = hash;

    return this.userRepository.save(user);
  }

  async findAllUserIntra(): Promise<UserIntra[]> {
    return this.userIntraRepository.find();
  }

  async findOneBy(login: string, email: string): Promise<UserIntra | null> {
    return this.userIntraRepository.findOne({where: {login, email}});
  }

  async createIntraUser(body: IntraUserDto): Promise<UserIntra> {
    const user: UserIntra = new UserIntra();

    user.login = body.login;
    user.displayname = body.displayname;
    const parts = body.displayname.split(" ");
    user.firstname = parts[0];
    user.lastname = parts[1];
    user.email = body.email;

    return this.userIntraRepository.save(user);
  }
}