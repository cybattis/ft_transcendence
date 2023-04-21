import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('42')
  async fortyTwoLogin() {
    const url = 'https://api.intra.42.fr/oauth/authorize' +
      '?client_id=' + process.env.FORTYTWO_CLIENT_ID +
      '&redirect_uri=' + encodeURIComponent('http://localhost:3000/auth/42/callback') +
      '&response_type=code';
    return { url };
  }
}