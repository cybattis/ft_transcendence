import { Module } from '@nestjs/common';
import { LogController } from './login.controller';

@Module({
    controllers: [LogController],
    providers: [],
})

export class LogModule {};