import { AppDataSource } from "../../config/data-source";
import { RouletteResult } from "./roulette_result.entity";

export const RouletteResultRepo = AppDataSource.getRepository(RouletteResult);