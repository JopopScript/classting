import { Role } from '../role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CustomValidateMessage } from '@/common/validator/custom-validate-message';

export class CreateUserDto {
  @ApiProperty({ type: String, description: '이름', example: '이성민', maxLength: 255 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsString({ message: CustomValidateMessage.isString })
  @MaxLength(255, { message: CustomValidateMessage.maxLength })
  name: string;

  @ApiProperty({ enum: Role, description: '권한', example: Role.STUDENT })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsEnum(Role, { message: CustomValidateMessage.isEnum })
  role: Role;
}
