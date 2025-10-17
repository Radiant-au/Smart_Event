import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TicketBatch } from "../ticket_batch/ticket_batch.entity";
import { User } from "../user/user.entity";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TicketBatch, (batch) => batch.tickets ,  { onDelete: "CASCADE" })
  batch!: TicketBatch;

  @Column({ unique: true })
  code!: string; // required

  @Column({ default: "unused" })
  status!: string; // unused | used

  @ManyToOne(() => User)
  scanner!: User;

  @Column({ nullable: true })
  qrToken?: string;

  @Column({ nullable: true })
  qrUrl?: string;

  @Column({ nullable: true })
  dynamicResult?: string; // e.g. "VIP Access"s
}
