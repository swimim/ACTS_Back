import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { gender } from "../enum/gender.enum";

@Entity()
export class user {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, unique: true })
  user_id: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ type: 'enum', enum: gender, nullable: false })
  gender: gender;
  
  @Column({ type: 'timestamp', nullable: false })
  birth: Date;
}