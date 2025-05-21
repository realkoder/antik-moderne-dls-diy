import { OrderCreate, OrderDto, OrderItemDto, OrderStatus, PosterDto } from "@realkoder/antik-moderne-shared-types";
import { prismaOrders } from "../db/database.js";
import { Order, OrderItem } from "@prisma/client";

export interface Response {
    success: boolean;
    message?: string;
    result?: string | number;
}

class OrdersService {
    private static instance: OrdersService;
    private constructor() { }

    public static getInstance(): OrdersService {
        if (!OrdersService.instance) {
            OrdersService.instance = new OrdersService();
        }
        return OrdersService.instance;
    }

    async findOne(id: number): Promise<OrderDto | null> {
        try {
            const order = await prismaOrders.order.findUnique({
                where: { id },
                include: {
                    orderItems: true,
                },
            });

            if (!order) return null;

            const posters = await fetchPosters(order);

            return {
                id: order.id,
                status: order.status as OrderStatus,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                orderItems: mapOrderItemsToOrderItemsDto(posters, order)
            };
        } catch (error) {
            console.error("Fetching order failed: ", error);
            return null;
        }
    }


    async findAllUsersOrders(userId: string): Promise<OrderDto[]> {
        try {
            const orders = await prismaOrders.order.findMany({
                where: { userId },
                include: {
                    orderItems: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const posters = await fetchPosters(orders);

            return orders.map(order => ({
                id: order.id,
                status: order.status as OrderStatus,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                orderItems: mapOrderItemsToOrderItemsDto(posters, order)
            }));
        } catch (error) {
            console.error("Fetching user orders failed: ", error);
            return [];
        }
    }

    async create(userId: string, orderCreate: OrderCreate): Promise<Response> {
        try {
            if (!orderCreate || !orderCreate.orderItems || orderCreate.orderItems.length === 0) {
                throw Error("Order or orderItems format is invalid");
            }

            await prismaOrders.$transaction(async (prisma) => {
                const persistedOrder = await prisma.order.create({
                    data: {
                        userId: userId,
                        status: "PENDING",
                        orderItems: {
                            create: orderCreate.orderItems.map(item => ({
                                posterId: item.posterId,
                                formatPriceId: item.formatPriceId,
                                quantity: item.quantity,
                            })),
                        },
                    },
                });

                if (persistedOrder) {
                    // TODO EMIT rabbitmq order created here
                }
            });

            return {
                success: true,
                message: "Order created",
            };
        } catch (error) {
            console.error("Order creation failed: ", error);
            return {
                success: false,
                message: "Error with creating order",
            };
        }
    }

    async updateOrderStatus(orderId: number, status: string): Promise<Response> {
        try {
            const updatedOrder = await prismaOrders.order.update({
                where: { id: orderId },
                data: { status },
            });

            return {
                success: true,
                message: "Order status updated",
                result: updatedOrder.id,
            };
        } catch (error) {
            console.error("Order status update failed: ", error);
            return {
                success: false,
                message: "Error updating order status",
            };
        }
    }
};


// ===========
// HELPERS
// ===========
async function fetchPosters(orders: any) {
    const posterIds = orders.map(order => order.orderItems.map(orderItem => orderItem.posterId));
    console.log("posterIDs to be fetched", posterIds);

    const posters = await Promise.all(posterIds.map(async (posterId) => {
        const posterRes = await fetch(`http://products-service:3004/products/api/v1/posters/${posterId}`);

        if (!posterRes.ok) {
            throw new Error(`Poster with ID ${posterId} not found`);
        }
        const { poster } = await posterRes.json();
        return poster;
    }));
    return posters as PosterDto[];
}

function mapOrderItemsToOrderItemsDto(posters: PosterDto[], order: any) {
    return order.orderItems.map(orderItem => {
        const orderPoster = posters.find(poster => poster.id === orderItem.posterId);
        const orderFormatPrice = orderPoster.formatPrices.find(formatPrice => formatPrice.id === orderItem.formatPriceId);

        return {
            id: orderItem.id,
            poster: orderPoster,
            formatPrice: orderFormatPrice,
            quantity: orderItem.quantity,
        } as OrderItemDto
    }) as OrderItemDto[];
}

export default OrdersService.getInstance();