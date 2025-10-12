import { AppDataSource } from "../../config/data-source";
import { User } from "./user.entity";

export const UserRepo = AppDataSource.getRepository(User);