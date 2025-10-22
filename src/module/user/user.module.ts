import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from './entity/user.entity';
import { verify_code } from '../auth/entity/verifyCode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([user, verify_code])
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
