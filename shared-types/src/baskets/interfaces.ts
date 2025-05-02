import { PosterDto } from "../products/interfaces";

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
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface BasketItemCreate {
    posterId: number;
    quantity: number;
}

