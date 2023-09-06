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
  @MaxLength(15)
  nickname: string;

  @IsString()
  @MaxLength(30)
  firstname: string;

  @IsString()
  @MaxLength(30)
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class TFAValidationDto {
  @IsString()
  code: string;
}
