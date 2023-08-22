import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entity/Users.entity';
import { GlobalService } from 'src/auth/global.service';
import { clientBaseURL } from '../utils/constant';
import { randomUUID } from 'crypto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User) {
    let uuid = randomUUID();
    while (GlobalService.confirmationLinks.has(uuid))
      uuid = randomUUID();

    GlobalService.confirmationLinks.set(uuid, user.id);

    const url = clientBaseURL + 'confirmation?' + uuid;

    return await this.mailerService.sendMail({
      to: user.email,
      from: process.env.EMAIL_USR,
      subject: 'Welcome to ThePong! Confirm your Email',
      template: 'confirmation',
      context: {
        name: user.nickname,
        url,
      },
    });
  }

  async sendCodeConfirmation(email: string): Promise<string> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const emails = GlobalService.emails;
    let find = false;
    let i = 1;
    while (emails && emails[i] != null) {
      if (emails[i] === email) {
        find = true;
        GlobalService.codes[i] = code;
        break;
      }
      i++;
    }
    if (!find) {
      GlobalService.emails[i] = email;
      GlobalService.codes[i] = code;
    }

    await this.mailerService.sendMail({
      to: email,
      from: process.env.EMAIL_USR,
      subject: 'Code confirmation for the login',
      template: 'code',
      context: {
        code,
      },
    });

    return code;
  }
}
