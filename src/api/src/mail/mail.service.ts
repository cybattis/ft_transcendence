import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entity/Users.entity';
import { GlobalService } from 'src/auth/global.service';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User) {
    const url = `http://localhost:3000/confirmation?` + user.id;

    await this.mailerService.sendMail({
      to: user.email,
      from : process.env.EMAIL_USR,
      subject: 'Welcome to ThePong! Confirm your Email',
      template: 'confirmation',
      context: {
        name: user.nickname,
        url,
      },
    });
  }

  async sendCodeConfirmation(email: string) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const emails = GlobalService.emails;
    let find = false;
    let i: number = 1;
    while (emails && emails[i] != null)
    {
      if (emails[i] === email)
      {
        find = true;
        GlobalService.codes[i] = code;
        break ;
      }
      i ++;
    }
    if (find === false)
    {
      GlobalService.emails[i] = email;
      GlobalService.codes[i] = code;
    }

    await this.mailerService.sendMail({
      to: email,
      from : process.env.EMAIL_USR,
      subject: 'Code confirmation for the login',
      template: 'code',
      context: {
        code,
      },
    });
    return code;
  }
}
