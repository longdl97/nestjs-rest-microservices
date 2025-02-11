import { Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'

import { UtilsModule } from '../utils/utils.module'

import { UsersController } from './user.controller'

@Module({
  imports: [
    UtilsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        safe: true,
        prettyPrint: process.env.NODE_ENV === 'development'
      }
    })
  ],
  controllers: [UsersController]
})
export class UsersModule {}
