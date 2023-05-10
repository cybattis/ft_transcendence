import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AllUsers } from './entity/allUsers.entity';
import { CreateAllUsersDto } from './dto/allUsers.dto';

@Injectable()
export class UserService {
  constructor(  
    @InjectRepository(AllUsers)
    private usersRepository: Repository<AllUsers>,
  ) {}

    async createUsers(body: CreateAllUsersDto): Promise<AllUsers> {
      const user: AllUsers = new AllUsers();

      user.username = body.username;
      user.email = body.email;

      return this.usersRepository.save(user);
    }

    async findByLogin(username: string): Promise<AllUsers | null> {
      return this.usersRepository.findOne({where: {username}});
    }

    async findByEmail(email: string): Promise<AllUsers | null> {
      return this.usersRepository.findOne({where: {email}});
    }

    async findAll(): Promise<AllUsers[]> {
      return this.usersRepository.find();
    }
}