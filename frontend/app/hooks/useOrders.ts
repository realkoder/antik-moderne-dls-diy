import { useAtom } from "jotai";
import { basketAtom } from "~/atoms/basketAtom";
import { useAuth } from "@clerk/react-router";
import { useFetch } from "~/lib/api-client";
import type { OrderCreate, OrderItemCreate } from "@realkoder/antik-moderne-shared-types";
import { toast } from "sonner";

const useOrders = () => {
    const { fetchData: postOrder } = useFetch<{ message: string }>();
    const { userId } = useAuth();
    const [basket, setBasket] = useAtom(basketAtom);

    

    const createOrder = async () => {
        if (!basket?.basketItems || basket.basketItems.length < 1 || !userId) return;

        const orderItems: OrderItemCreate[] = basket.basketItems.map(basketItem => ({
            posterId: basketItem.poster.id,
            formatPriceId: basketItem.formatPrice.id,
            quantity: basketItem.quantity
        } as OrderItemCreate));

        const orderCreate: OrderCreate = { orderItems }

        const response = await postOrder(
            "/orders/auth/api/v1/orders",
            { method: "POST", data: { orderCreate } }
        );

        if (response && response.message && response.message === "PENDING") {
            toast.info("Your order is pending");
        }
    }

    return { createOrder };
}

export default useOrders;