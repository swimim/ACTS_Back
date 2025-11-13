import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { gender } from "../enum/gender.enum";
import { ProviderEnum } from "../enum/provider.enum";

@Entity()
export class user {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, type: 'varchar', length: 10, unique: true })
  username: string;

  @Column({ nullable: true, type: 'char', length: 60 })
  password: string;
 
  @Column({ nullable: false, type:'varchar', unique: true })
  email: string;

  @Column({ nullable: false, type: 'enum', enum: gender })
  gender: gender;
  
  @Column({ type: 'timestamp', nullable: false })
  birth: Date;

  @Column({ nullable: false, default: ProviderEnum.NATIVE })
  provider: ProviderEnum;
}