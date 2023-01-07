import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { NewsModule } from './news/news.module';
import { typeormConfig } from './ormconfig';
import { SchoolModule } from './school/school.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    UserModule,
    SchoolModule,
    NewsModule,
    SubscribeModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware)
      .exclude({ path: '/health', method: RequestMethod.GET })
      .forRoutes('*')
  }
}