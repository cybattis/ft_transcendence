import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class IntraUserDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  image: {
    link: string;
  };

  @IsNotEmpty()
  @IsString()
  displayname: string;

  @IsEmail()
  email: string;
}
