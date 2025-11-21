import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from './entity/user.entity';
import { verify_code } from '../auth/entity/verifyCode.entity';
import { JwtAccessStrategy } from '../auth/strategy/jwt-access.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([user, verify_code])
  ],
  controllers: [UserController],
  providers: [UserService, JwtAccessStrategy]
})
export class UserModule {}
