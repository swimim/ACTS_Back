import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { nullable: false })
  @JoinColumn({ name: 'chatIdx' })
  chat: Chat;

  @Column({ nullable: false })
  chatIdx: number;

  @Column({ nullable: false, type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
