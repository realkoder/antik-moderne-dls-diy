export type Format = "A4" | "30x30 cm" | "30x40 cm" | "50x50" | "50x70 cm" | "70x70 cm" | "70x100 cm" | "100x100 cm" | "100x140 cm";

export interface FormatPriceDto {
    id: number;
    format: Format;
    price: number
}

export interface FormatPriceCreate {
    format: Format;
    price: number
}

export interface PosterDto {
    id: number;
    title: string;
    artistFullName: string;
    posterImageUrl: string;
    formatPrices: FormatPriceDto[];
    createdAt: Date;
}

export interface PosterUpdate {
    title: string;
    artistFullName: string;
    posterImageUrl: string;
    formatPrices: FormatPriceDto[];
}

export interface PosterCreate {
    title: string;
    artistFullName: string;
    posterImageUrl: string;
    formatPrices: FormatPriceCreate[];
}