import { BaseEntity } from "@/common/entities/base-entity";
import { School } from "@/school/entities/school.entity";
import { Subscribe } from "@/subscribe/entities/subscribe.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { Role } from "../role.enum";

@Index('ix_user_name', ['name'])
@Entity('user')
export class User extends BaseEntity{
  @ApiProperty({ description: '이름', maxLength: 255, example: '이성민', uniqueItems: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: '권한', example: 'STUDENT', enum: Role })
  @Column({ type: 'varchar', length: 30 })
  role: Role;

  @OneToMany(() => School, (school) => school.user)
  schools: School[];

  @OneToMany(() => Subscribe, (subscribe) => subscribe.user)
  subscribes: Subscribe[];
}
