import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAllUsersDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsEmail()
    email: string;
}