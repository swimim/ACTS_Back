import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class verify_code {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'varchar', unique: true})
  email: string

  @Column({ type: 'varchar', length: 6 })
  code: string

  @Column({ type: 'timestamp' })
  createdAt: Date

  @Column({ type: 'boolean', default: false })
  verified: boolean
}