import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Chat } from './entity/chat.entity';
import { ChatMessage, MessageRole } from './entity/chatMessage.entity';
import { Response } from 'express';
import { InternalServerError } from 'openai';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getChatList(userIdx: number): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: { userIdx },
      order: { updatedAt: 'DESC' },
    });
  }

  async getChatHistory(chatIdx: number, userIdx: number): Promise<ChatMessage[]> {
    const chat = await this.chatRepository.findOne({
      where: { idx: chatIdx, userIdx },
    });

    if (!chat) {
      throw new NotFoundException('채팅을 찾지 못 했습니다.');
    }

    return await this.chatMessageRepository.find({
      where: { chatIdx },
      order: { createdAt: 'ASC' },
    });
  }

  async createChat(userIdx: number, title: string): Promise<Chat> {
    const chat = this.chatRepository.create({
      userIdx,
      title,
    });
    return await this.chatRepository.save(chat);
  }

  async streamChatResponse(
    chatIdx: number | undefined,
    userIdx: number,
    message: string,
    title: string | undefined,
    res: Response,
  ): Promise<void> {
    let chat: Chat;

    if (!chatIdx) {
      chat = await this.createChat(userIdx, title || 'New Chat');
      chatIdx = chat.idx;
    } else {
      const foundChat = await this.chatRepository.findOne({
        where: { idx: chatIdx, userIdx },
      });

      if (!foundChat) {
        throw new Error('채팅을 찾지 못 했습니다.');
      }
      chat = foundChat;
    }

    const userMessage = this.chatMessageRepository.create({
      chatIdx,
      role: MessageRole.USER,
      content: message,
    });
    await this.chatMessageRepository.save(userMessage);

    const history = await this.chatMessageRepository.find({
      where: { chatIdx },
      order: { createdAt: 'ASC' },
    });

    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'chatIdx', chatIdx })}\n\n`);

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
        }
      }

      const assistantMessage = this.chatMessageRepository.create({
        chatIdx,
        role: MessageRole.ASSISTANT,
        content: fullResponse,
      });
      await this.chatMessageRepository.save(assistantMessage);

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }

  async updateChatTitle(userIdx: number, chatIdx: number, title: string) {
    const chat = await this.chatRepository.findOne({
      where: { idx: chatIdx, userIdx },
    });

    if (!chat) {
      throw new NotFoundException('채팅을 찾지 못 했습니다.');
    }

    chat.title = title;
    
    try {
      await this.chatRepository.save(chat);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
