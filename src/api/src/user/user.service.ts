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

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: id } });
  }

  async findByEmail(email: string): Promise<any> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  async findUser(email: string, password: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email, password: password } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async isVerified(email: string): Promise<User | null> {
    return this.usersRepository.findOne({where: {email: email, isVerified: true}})
  }

  async authActivated(email: string): Promise<User | null> {
    return this.usersRepository.findOne({where: {email: email, authActivated: true}})
  }

  async updateValidation(id: number) {
    this.usersRepository.update(id, {
      isVerified: true,
    });
  }

  async updateAuth(id: number) {
    this.usersRepository.update(id, {
      authActivated: true,
    });
  }

  async changeOnlineStatus(id: number, state: boolean) {
    this.usersRepository.update(id, {
      online: state,
    })
  }
}
