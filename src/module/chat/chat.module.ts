import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entity/chat.entity';
import { ChatMessage } from './entity/chatMessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMessage])],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
