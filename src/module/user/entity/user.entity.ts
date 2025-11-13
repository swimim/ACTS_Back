import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ProviderEnum } from "../enum/provider.enum";
import { GenderEnum } from "../enum/gender.enum";

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

  @Column({ nullable: false, type: 'enum', enum: GenderEnum })
  gender: GenderEnum;
  
  @Column({ type: 'timestamp', nullable: false })
  birth: Date;

  @Column({ nullable: false, default: ProviderEnum.NATIVE })
  provider: ProviderEnum;
}