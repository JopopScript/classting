import { CustomValidateMessage } from "@/common/validator/custom-validate-message";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Area } from "../area.enum";

export class CreateSchoolDto {
  @ApiProperty({ type: String, description: '학교명', example: '경기고등학교', maxLength: 255, uniqueItems: true })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsString({ message: CustomValidateMessage.isString })
  @MaxLength(255, { message: CustomValidateMessage.maxLength })
  name: string;

  @ApiProperty({ enum: Area, description: '지역', example: Area.GYEONGGI, maxLength: 20 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsEnum(Area, { message: CustomValidateMessage.isEnum })
  @MaxLength(20, { message: CustomValidateMessage.maxLength })
  area: Area;

  @ApiProperty({ type: 'integer', description: '작성한 사용자 아이디 ', example: 1 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  userId: number;
}