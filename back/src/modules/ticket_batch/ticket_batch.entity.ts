import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { Ticket } from "../ticket/ticket.entity";
import { Events } from "../event/event.entity";

@Entity("ticket_batches")
export class TicketBatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Events, (events) => events.ticketBatches, { onDelete: "CASCADE" })
  event!: Events; // Each batch belongs to an event

  @OneToMany(() => Ticket, (ticket) => ticket.batch)
  tickets!: Ticket[]; // Tickets in this batch

  @Column()
  name!: string; // e.g., "VIP 5000 Kyats", "Regular 2000 Kyats"

  @Column("decimal", { precision: 10, scale: 2 , default : 0})
  price!: number; // Price of tickets in this batch

  @Column({ default: true })
  isActive!: boolean; // If this batch is valid/available

  @Column({ nullable: true })
  dynamicConfig?: string; // JSON for dynamic features like roulette, discount type, QR redirect

  @CreateDateColumn()
  createdAt!: Date;
}
