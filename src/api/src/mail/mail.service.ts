import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entity/Users.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `http://localhost:3000/`;

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
}
