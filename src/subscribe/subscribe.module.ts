import { SchoolModule } from '@/school/school.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { SubscribeController } from './subscribe.controller';
import { SubscribeService } from './subscribe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscribe]),
    UserModule,
    SchoolModule,
  ],
  controllers: [SubscribeController],
  providers: [SubscribeService]
})
export class SubscribeModule {}
