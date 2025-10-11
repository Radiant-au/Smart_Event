import { AppDataSource } from "../../config/data-source";
import { Roulette } from "./roulette.entity";

export const RouletteRepo = AppDataSource.getRepository(Roulette);