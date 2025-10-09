import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../modules/user/user.entity";
import { Events } from "../modules/event/event.entity";
import { Ticket } from "../modules/ticket/ticket.entity";
import { TicketBatch } from "../modules/ticket_batch/ticket_batch.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,   
  logging: true,
  entities: [User , Events , Ticket , TicketBatch],
});
