import {
  IsEmail,
  IsEnum,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { AppRole } from "../../auth/roles.constant";

export class CreateUserDto {
  @IsString()
  @Length(3, 120)
  @Matches(/^[A-Za-z0-9._-]+$/)
  username!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @Length(2, 255)
  fullName!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password!: string;

  @IsEnum(AppRole)
  role!: AppRole;
}
