import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class IntraUserDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  image: {
    link: string;
  };

  @IsEmail()
  email: string;
}

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  // @IsStrongPassword()
  password: string;
}

export interface SigninDto {
  nickname: string;
  email: string;
  IsIntra: boolean;
}
