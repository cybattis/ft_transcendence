import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {

   constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
   ) {}

   getUser() {
    return 'Page pour le player';
  }
}