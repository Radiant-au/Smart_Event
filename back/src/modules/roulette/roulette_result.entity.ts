import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roulette } from "./roulette.entity";
import { Ticket } from "../ticket/ticket.entity";

@Entity()
export class RouletteResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Roulette, { onDelete: "CASCADE" })
  roulette!: Roulette;

  @ManyToOne(() => Ticket, { onDelete: "CASCADE" })
  ticket!: Ticket;

  @Column()
  result!: string; // e.g. "Free Drink"

  @CreateDateColumn()
  created_At!: Date;
}
