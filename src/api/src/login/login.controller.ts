import { Controller, Get, Param, Redirect } from '@nestjs/common'

@Controller('/login')
export class LogController {
    constructor() {}

    @Get()
    @Redirect(
        'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4' +
        '&redirect_uri=http%3A%2F%2F127.0.0.1%3A5400' +
        '&response_type=code', 302
    )
    intra() {};
}