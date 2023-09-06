import {
  IsNotEmpty,
  IsString,
  MaxLength
} from "class-validator";

export class UserSettingsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  nickname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  lastname: string;
}

export class PaddleColorDto {
  @IsString()
  @IsNotEmpty()
  color: string;
}
