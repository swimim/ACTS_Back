import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class verify_code {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'varchar', unique: true})
  email: string

  @Column({ type: 'varchar', length: 6 })
  code: string

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date

  @Column({ type: 'boolean', name:'is_verified', default: false })
  isVerified: boolean
}