import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MemberUserEntity } from '../member-user/member-user.entity'
import { MemberUserController } from './member-user-app.controller'
import { MemberUserService } from './member-user-app.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberUserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secretkey'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MemberUserController],
  providers: [MemberUserService],
})
export class MemberUserAppModule {}
