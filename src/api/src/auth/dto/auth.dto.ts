import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class IntraSignupDto {
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

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
