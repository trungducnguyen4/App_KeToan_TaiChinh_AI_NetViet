import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class BootstrapDto {
  @IsString()
  @Length(3, 120)
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message:
      "Tên đăng nhập chỉ được chứa chữ cái, chữ số, dấu chấm, gạch ngang và gạch dưới",
  })
  username!: string;

  @IsEmail(
    {},
    {
      message: "Email không hợp lệ",
    },
  )
  @MaxLength(255)
  email!: string;

  @IsString()
  @Length(2, 255)
  fullName!: string;

  @IsString()
  @MinLength(10, {
    message: "Mật khẩu phải có ít nhất 10 ký tự",
  })
  @MaxLength(128)
  password!: string;
}
