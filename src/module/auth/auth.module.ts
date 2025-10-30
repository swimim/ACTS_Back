import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from '../user/entity/user.entity';
import { verify_code } from './entity/verifyCode.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { refreshToken } from './entity/refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStretagy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([user, verify_code, refreshToken]),
    MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: configService.get('MAIL_USER'),
              pass: configService.get('MAIL_PASS'),
            },
          },
          defaults: {
            from: `"ACTS" <${configService.get('MAIL_USER')}>`,
          },
        }),
        inject: [ConfigService]
      }),
      JwtModule.registerAsync({
        global: true,
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('TOKEN_SECRET'),
          signOptions: { expiresIn: '5m' },
        }),
        inject: [ConfigService]
      }),
      PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStretagy]
})
export class AuthModule {}
