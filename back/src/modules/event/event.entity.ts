import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinTable, ManyToMany } from "typeorm";
import { TicketBatch } from "../ticket_batch/ticket_batch.entity";
import { User } from "../user/user.entity";

@Entity()
export class Events {
  
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({unique : true})
  code!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  location?: string;

  // @Column({ nullable: true })
  // status?: string;

  @ManyToOne(() => User, (user) => user.events, { onDelete: "CASCADE" })
  creator!: User;

  @ManyToMany(() => User, { onDelete: "CASCADE" })
  @JoinTable({
    name: "collaborator",
    joinColumns: [
      { name: "eventId", referencedColumnName: "id" }
    ],
    inverseJoinColumns: [
      { name: "userId", referencedColumnName: "id" }
    ]
  })
  collaborators!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TicketBatch, (batch) => batch.event)
  ticketBatches!: TicketBatch[];
}
