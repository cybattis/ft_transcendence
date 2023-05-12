import { Injectable, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/Users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByLogin(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickname: nickname } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  async findUser(email: string, password: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email, password: password } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateValidation(login: string) {
    console.log(login);
    return this.usersRepository.update(login, {
      isVerified: true,
    })
  }
}
