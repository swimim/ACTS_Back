import { user } from "src/module/user/entity/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { catScore } from "./cat-score.entity";

@Entity()
@Index(['user', 'day_of_week'], { unique: true })
export class report {
  @PrimaryGeneratedColumn()
  idx: number

  @Column({ type: 'int' })
  day_of_week: number

  @Column({ type: 'double' })
  p_final: number

  @Column({ type: 'int' })
  label_final: number

  @OneToOne(() => catScore, catScore => catScore.report)
  @JoinColumn()
  cat_score: catScore

  @ManyToOne(() => user, user => user.reports)
  user: user

  @Column({ type: 'timestamp' })
  reported_at: Date
}