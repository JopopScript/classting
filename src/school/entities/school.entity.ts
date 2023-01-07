import { OneToMany } from 'typeorm';
import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from "@/common/entities/base-entity";
import { Area } from '../area.enum';
import { Subscribe } from '@/subscribe/entities/subscribe.entity';
import { News } from '@/news/entities/news.entity';
import { User } from '@/user/entities/user.entity';

@Index('ix_school_name', ['name'], { unique: true })
@Entity('school')
export class School extends BaseEntity{
  @ApiProperty({ description: '학교 이름', maxLength: 255, example: '경기고등학교', uniqueItems: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ description: '지역', maxLength: 20, example: 'SEOUL', enum: Area })
  @Column({ type: 'varchar', length: 20 })
  area: Area;
  
  @ApiProperty({ description: '학교를 생성한 사용자 아이디', example: 1, type: 'integer' })
  @Column({ type: 'int4', name: 'user_id' })
  userId: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.subscribes, { cascade: ['update', 'soft-remove'] })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => News, (news) => news.school)
  newsList: News[];

  @OneToMany(() => Subscribe, (subscribe) => subscribe.school)
  subscribes: Subscribe[];
}
