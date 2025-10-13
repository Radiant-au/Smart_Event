export interface TicketBatchDto {
    name: string;
    price?: number;
    dynamicConfig?: string;
    ticket : number;
}

export interface GetBatchesByEventParamsDto {
    id: number;
}

export interface TicketBatchResponseDto {
    id: number;
    name: string;
    price: number;
    isActive: boolean;
    dynamic: boolean;
    createdAt: Date;
}