import { FormatPriceDto, PosterDto } from "../products";

export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface OrderItemCreate {
    posterId: number;
    formatPriceId?: number;
    quantity: number;
}

export interface OrderCreate {
    orderItems: OrderItemCreate[];
}

export interface OrderItemDto {
    id: number;
    poster: PosterDto;
    formatPrice: FormatPriceDto;
    quantity: number;
}

export interface OrderDto {
    id: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
    orderItems: OrderItemDto[];
}