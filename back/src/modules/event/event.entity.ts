import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { TicketBatch } from "../ticket_batch/ticket_batch.entity";
import { User } from "../user/user.entity";

@Entity()
export class Events {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.events, { onDelete: "CASCADE" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TicketBatch, (batch) => batch.event)
  ticketBatches!: TicketBatch[];
}
