import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { user } from "src/module/user/entity/user.entity";
import { ChatMessage } from "./chatMessage.entity";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, type: 'varchar', length: 255 })
  title: string;

  @ManyToOne(() => user, { nullable: false })
  @JoinColumn({ name: 'userIdx' })
  user: user;

  @Column({ nullable: false })
  userIdx: number;

  @OneToMany(() => ChatMessage, (message) => message.chat)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
