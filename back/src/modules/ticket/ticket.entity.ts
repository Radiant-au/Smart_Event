import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TicketBatch } from "../ticket_batch/ticket_batch.entity";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TicketBatch, (batch) => batch.tickets, { onDelete: "CASCADE" })
  batch!: TicketBatch;

  @Column({ unique: true })
  code!: string; // required

  @Column({ default: "unused" })
  status!: string; // unused | used

  @Column({ nullable: true })
  dynamicConfig?: string; // JSON for dynamic features like roulette, discount type, QR redirect

  @CreateDateColumn()
  createdAt!: Date;
}
