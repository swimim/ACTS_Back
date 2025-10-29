import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { gender } from "../enum/gender.enum";

@Entity()
export class user {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, type: 'varchar', length: 10, unique: true })
  username: string;

  @Column({ nullable: false, type: 'char', length: 60 })
  password: string;

  @Column({ nullable: false, type:'varchar', unique: true })
  email: string;

  @Column({ nullable: false, type: 'enum', enum: gender })
  gender: gender;
  
  @Column({ type: 'timestamp', nullable: false })
  birth: Date;
}