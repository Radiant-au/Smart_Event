import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Ticket } from "../ticket/ticket.entity";
import { Events } from "../event/event.entity";
import { Roulette } from "../roulette/roulette.entity";

@Entity("ticket_batches")
export class TicketBatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Events, (events) => events.ticketBatches, { onDelete: "CASCADE" , cascade: true})
  event!: Events; // Each batch belongs to an event

  @OneToMany(() => Ticket, (ticket) => ticket.batch , { cascade: true})
  tickets!: Ticket[]; // Tickets in this batch

  @OneToOne(() => Roulette, (roulette) => roulette.batch, { nullable: true, cascade: true})
  @JoinColumn()
  roulette?: Roulette; // Only exists if batch is dynamic

  @Column({ nullable: true })
  dynamicUrl?: string; // e.g. https://smart-events.com/roulette/spin/{ticketCode}

  @Column()
  name!: string; // e.g., "VIP 5000 Kyats", "Regular 2000 Kyats"

  @Column("decimal", { precision: 10, scale: 2 , default : 0})
  price!: number; // Price of tickets in this batch

  @Column({ default: true })
  isActive!: boolean; // If this batch is valid/available

  @Column({ default: false })
  dynamic!: boolean; 

  @CreateDateColumn()
  createdAt!: Date;
}
