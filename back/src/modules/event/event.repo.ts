import { AppDataSource } from "../../config/data-source";
import { Events } from "./event.entity";

export const EventRepo = AppDataSource.getRepository(Events);