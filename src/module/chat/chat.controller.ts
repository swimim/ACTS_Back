import { GetUser } from "src/common/decorators/getUser.decorator";
import { JwtAccessGuard } from "../auth/guard/jwt-access.guard";
import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/send-message.dto";
import type { Response } from "express";

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('/list')
  @UseGuards(JwtAccessGuard)
  async getChatList(@GetUser() user) {
    const userIdx = user.userIdx;
    return await this.chatService.getChatList(userIdx);
  }

  @Get('/:chatIdx')
  @UseGuards(JwtAccessGuard)
  async getChatLog(@GetUser() user, @Param('chatIdx', ParseIntPipe) chatIdx: number) {
    const userIdx = user.userIdx;
    return await this.chatService.getChatHistory(chatIdx, userIdx);
  }

  @Post('/stream')
  @UseGuards(JwtAccessGuard)
  async sendMessage(@GetUser() user, @Body() body: SendMessageDto, @Res() res: Response) {
    const userIdx = user.userIdx;
    await this.chatService.streamChatResponse(
      body.chatIdx,
      userIdx,
      body.message,
      body.title,
      res
    );
  }
}