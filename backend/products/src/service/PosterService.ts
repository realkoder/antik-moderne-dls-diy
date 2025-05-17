
import { RemovedPoster, Format as FormatEnum } from "@prisma/client";
import { prismaProducts } from "../db/database.js";
import { Format, PosterCreate, PosterDto, PosterUpdate } from "@realkoder/antik-moderne-shared-types";


export interface Response {
    success: boolean;
    message?: string;
    result?: string | number;
}

class PosterService {
    private static instance: PosterService;
    private constructor() { }

    public static getInstance(): PosterService {
        if (!PosterService.instance) {
            PosterService.instance = new PosterService();
        }
        return PosterService.instance;
    }

    async create(posterCreate: PosterCreate): Promise<Response> {
        try {
            if (!posterCreate || posterCreate.formatPrices.length === 0) {
                // throw APIError.notFound("Poster or formatPrices format is invalid");
                throw Error("Poster or formatPrices format is invalid");
            }

            await prismaProducts.$transaction(async (prisma) => {

                const createdPoster = await prisma.poster.create({
                    data: {}
                });

                const createdPosterDescription = await prisma.posterDescription.create({
                    data: {
                        posterId: createdPoster.id,
                        title: posterCreate.title,
                        artistFullName: posterCreate.artistFullName,
                        posterImageUrl: posterCreate.posterImageUrl,
                    }
                });
                const createdFormatPrice = await prisma.formatPrice.create({});

                await Promise.all(posterCreate.formatPrices.map(async ({ format, price }) => {

                    await prisma.formatPriceDescription.create({
                        data: {
                            formatPriceId: createdFormatPrice.id,
                            posterDescriptionId: createdPosterDescription.id,
                            format: mapTypeScriptToPrismaFormat(format),
                            price,
                            createdAt: new Date(),
                        },
                    });
                }));
            });

            return {
                success: true,
                message: "Product created",
            };
        } catch (error) {
            console.error("Transactional usercreation failed: ", error);

            return {
                success: false,
                message: "Error with adding new poster",
            };
        }
    }

    async update(id: number, posterUpdate: PosterUpdate): Promise<Response> {
        try {
            if (await PosterService.getInstance().getRemovedPoster(id)) {
                // throw APIError.unavailable("Poster is already deleted");
                throw Error("Poster is already deleted");
            }

            await prismaProducts.$transaction(async (prisma) => {

                const currentPoster = await prismaProducts.poster.findUnique({
                    where: { id },
                    include: {
                        posterDescriptions: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                            include: { formatPriceDescriptions: true }
                        },
                    },
                });

                if (!currentPoster || currentPoster.posterDescriptions.length === 0 || currentPoster.posterDescriptions[0].formatPriceDescriptions.length === 0) {
                    // throw APIError.notFound("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
                    throw Error("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
                }

                const updatedPosterDescription = await prisma.posterDescription.create({
                    data: {
                        posterId: currentPoster.id,
                        title: posterUpdate.title,
                        artistFullName: posterUpdate.artistFullName,
                        posterImageUrl: posterUpdate.posterImageUrl,
                    }
                });

                const currentFormatPriceIds = currentPoster.posterDescriptions[0].formatPriceDescriptions.map(fp => fp.id);

                const updatedFormatPriceIds = posterUpdate.formatPrices.map(fp => fp.id).filter(id => id !== undefined);

                const removedFormatPriceIds = currentFormatPriceIds.filter(id => !updatedFormatPriceIds.includes(id));

                await Promise.all(removedFormatPriceIds.map(async (formatPriceId) => {
                    await prisma.removedFormatPrice.create({ data: { formatPriceId } })
                }))

                await Promise.all(posterUpdate.formatPrices.map(async (formatPrice) => {
                    await prisma.formatPriceDescription.create({
                        data: {
                            formatPriceId: formatPrice.id,
                            posterDescriptionId: updatedPosterDescription.id,
                            format: mapTypeScriptToPrismaFormat(formatPrice.format),
                            price: formatPrice.price,
                        },
                    });
                }));
            });

            return {
                success: true,
                message: "Poster updated successfully."
            };
        } catch (error) {
            console.error("Error thrown while updating", error);
            return {
                success: false,
                message: "Error updating poster",
            };
        }
    }

    async findAll(): Promise<PosterDto[]> {
        const posters = await prismaProducts.poster.findMany({
            where: {
                removedPoster: null
            },
            include: {
                posterDescriptions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: { formatPriceDescriptions: true }
                },
            },
        });

        if (posters && posters.length === 0) return [];

        if (!posters || posters[0].posterDescriptions.length === 0 || posters[0].posterDescriptions[0].formatPriceDescriptions.length === 0) {
            // throw APIError.notFound("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
            throw Error("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
        }

        const postersWithFormattedPrices = posters.map(poster => ({
            id: poster.id,
            title: poster.posterDescriptions[0].title,
            artistFullName: poster.posterDescriptions[0].artistFullName,
            posterImageUrl: poster.posterDescriptions[0].posterImageUrl,
            createdAt: poster.posterDescriptions[0].createdAt,
            formatPrices: poster.posterDescriptions[0].formatPriceDescriptions.map(formatPrice => ({
                ...formatPrice,
                format: mapPrismaFormatToTypeScript(formatPrice.format),
            })),
        }));

        return postersWithFormattedPrices;
    }

    async findOne(id: number): Promise<PosterDto | null> {
        if (await PosterService.getInstance().getRemovedPoster(id)) {
            // throw APIError.unavailable("Poster is already deleted");
            throw Error("Poster is already deleted");
        }

        const poster = await prismaProducts.poster.findFirst({
            where: { id: id },
            include: {
                posterDescriptions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: { formatPriceDescriptions: true }
                },
            },
        });

        if (!poster || poster.posterDescriptions.length === 0 || poster.posterDescriptions[0].formatPriceDescriptions.length === 0) {
            // throw APIError.notFound("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
            throw Error("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
        }

        const formatPricesFixed = poster.posterDescriptions[0].formatPriceDescriptions.map(formatPrice => ({ ...formatPrice, format: mapPrismaFormatToTypeScript(formatPrice.format) }))

        return {
            id: poster.id,
            title: poster.posterDescriptions[0].title,
            artistFullName: poster.posterDescriptions[0].artistFullName,
            posterImageUrl: poster.posterDescriptions[0].posterImageUrl,
            createdAt: poster.posterDescriptions[0].createdAt,
            formatPrices: formatPricesFixed
        };
    }

    async delete(posterId: number): Promise<Response> {
        try {
            if (await PosterService.getInstance().getRemovedPoster(posterId)) {
                // throw APIError.unavailable("Poster is already deleted");
                throw Error("Poster is already deleted");
            }

            await prismaProducts.$transaction(async (prisma) => {
                const poster = await prisma.poster.findUnique({
                    where: { id: posterId },
                    include: {
                        posterDescriptions: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                            include: { formatPriceDescriptions: true }
                        },
                    },
                });

                if (!poster || poster.posterDescriptions.length === 0 || poster.posterDescriptions[0].formatPriceDescriptions.length === 0) {
                    // throw APIError.notFound("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
                    throw Error("Poster, PosterDescription or PosterFormatPricesDescriptions not found");
                }

                const formatPriceId = poster.posterDescriptions[0].formatPriceDescriptions[0].formatPriceId
                await prisma.removedFormatPrice.create({ data: { formatPriceId } })

                await prisma.removedPoster.create({ data: { posterId: poster.id } });
            });

            return {
                success: true,
                message: "Poster moved to RemovedPoster and deleted successfully",
            };
        } catch (error) {
            console.error("Error moving poster to RemovedPoster", error);
            return {
                success: false,
                message: "Error moving poster to RemovedPoster",
            };
        }
    }

    async getRemovedPoster(posterId: number): Promise<RemovedPoster | null> {
        try {
            return await prismaProducts.removedPoster.findFirst({
                where: { posterId }
            });

        } catch (e) {
            console.error("Error with retrieving ", e)
            return null;
        }
    }
};


function mapPrismaFormatToTypeScript(prismaFormat: string): Format {
    const mapping: { [key: string]: Format } = {
        "A4": "A4",
        "Size_30x30_cm": "30x30 cm",
        "Size_30x40_cm": "30x40 cm",
        "Size_50x50": "50x50",
        "Size_50x70_cm": "50x70 cm",
        "Size_70x70_cm": "70x70 cm",
        "Size_70x100_cm": "70x100 cm",
        "Size_100x100_cm": "100x100 cm",
        "Size_100x140_cm": "100x140 cm",
    };
    return mapping[prismaFormat] || prismaFormat as Format;
}

function mapTypeScriptToPrismaFormat(typeScriptFormat: Format): FormatEnum {
    const mapping: { [key in Format]: FormatEnum } = {
        "A4": "A4",
        "30x30 cm": "Size_30x30_cm",
        "30x40 cm": "Size_30x40_cm",
        "50x50": "Size_50x50",
        "50x70 cm": "Size_50x70_cm",
        "70x70 cm": "Size_70x70_cm",
        "70x100 cm": "Size_70x100_cm",
        "100x100 cm": "Size_100x100_cm",
        "100x140 cm": "Size_100x140_cm",
    };
    return mapping[typeScriptFormat] as FormatEnum;
}

export default PosterService.getInstance();