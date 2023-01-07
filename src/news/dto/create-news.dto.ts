import { CustomValidateMessage } from "@/common/validator/custom-validate-message";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateNewsDto {
  @ApiProperty({ type: 'string', description: '제목', example: '학사일정', maxLength: 255 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsString({ message: CustomValidateMessage.isString })
  @MaxLength(255, { message: CustomValidateMessage.maxLength })
  title: string;

  @ApiProperty({ type: 'text', description: '내용', example: '3/2: 1학기시작\n 4/20~4/26: 중간고사 ....' })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsString({ message: CustomValidateMessage.isString })
  contents: string;
  
  @ApiProperty({ type: 'integer', description: '소식을 작성한 학교 아이디', example: 1 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  schoolId: number;
}
