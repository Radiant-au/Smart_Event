import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from "typeorm";
import { TicketBatch } from "../ticket_batch/ticket_batch.entity";

@Entity()
export class Roulette {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => TicketBatch, (batch) => batch.roulette, { onDelete: "CASCADE" })
  batch!: TicketBatch; // belongs strictly to one batch

  @Column("json")
  sectors!: string[]; // 8 values entered by event creator

  @CreateDateColumn()
  createdAt!: Date;
}
