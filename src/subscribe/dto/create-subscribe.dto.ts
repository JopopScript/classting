import { CustomValidateMessage } from "@/common/validator/custom-validate-message";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateSubscribeDto {
  @ApiProperty({ type: 'integer', description: '구독한 사용자 아이디 ', example: 1 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  userId: number;

  @ApiProperty({ type: 'integer', description: '구독할 학교 아이디 ', example: 1 })
  @IsNotEmpty({ message: CustomValidateMessage.isNotEmpty })
  @IsInt({ message: CustomValidateMessage.isInt })
  schoolId: number;
}
