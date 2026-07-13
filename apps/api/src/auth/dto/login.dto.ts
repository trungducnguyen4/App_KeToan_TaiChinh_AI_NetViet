import { IsString, Length, MaxLength } from "class-validator";

export class LoginDto {
  @IsString()
  @Length(3, 255)
  login!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
