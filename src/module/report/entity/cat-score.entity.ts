import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { report } from "./report.entity";

@Entity()
export class catScore {
  @PrimaryGeneratedColumn()
  idx: number

  @Column({ type: 'int' })
  simple: number

  @Column({ type: 'int' })
  sustained: number

  @Column({ type: 'int' })
  interference: number

  @Column({ type: 'int' })
  divided: number

  @Column({ type: 'int' })
  working_memory: number

  @OneToOne(() => report, report => report.cat_score)
  report: report
}