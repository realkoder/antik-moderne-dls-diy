import { FormatPriceDto, PosterDto } from "../products/interfaces.js";

export interface BasketDto {
    id: number;
    userId: string | null; // Either has userId or GUID if client isn't signed in
    guid: string | null; //Globally Unique Identifier (GUID)
    createdAt: Date;
    updatedAt: Date;
    basketItems: BasketItemDto[];
}

export interface BasketItemDto {
    id: number;
    poster: PosterDto;
    formatPrice: FormatPriceDto
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface BasketItemCreate {
    posterId: number;
    formatPriceId: number;
    quantity: number;
}

