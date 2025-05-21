import { useAtom } from "jotai";
import { basketAtom } from "~/atoms/basketAtom";
import { useAuth } from "@clerk/react-router";
import { useFetch } from "~/lib/api-client";
import type { BasketDto, BasketItemCreate, OrderCreate, OrderItemCreate } from "@realkoder/antik-moderne-shared-types";

const useBasket = () => {
    const { fetchData } = useFetch<{ basket: BasketDto }>();
    const { userId } = useAuth();
    const [basket, setBasket] = useAtom(basketAtom);


    const createOrder = async (basketItemCreate: BasketItemCreate) => {
        if (!basket?.basketItems || basket.basketItems.length < 1 || !userId) return;
        const orderCreate: OrderCreate = basket.basketItems.map(basketItem => {
            const orderItems: OrderItemCreate[] = {
                posterId: basketItem.poster.id;
                formatPriceId?: basketItem.;
                quantity: basketItem.quantity;
            }
            return {
                orderItems
            }
        })
        const response = await fetchData(
            "/orders/auth/api/v1/orders",
            { method: "POST", data: { guid, basketItemCreate } }
        );

        if (response && response.basket) {
            setBasket(response.basket);
        }
    }

    const removeItemFromBasket = async (basketItemId: number) => {
        // let response;
        // if (userId) {
        //     if (!authRequestClient) return;
        //     response = await authRequestClient.basket.removeItemFromBasket({ basketItemId: basketItemId });
        // } else {
        //     const guid = localStorage.getItem("basketguid");
        //     if (guid) {
        //         response = await getRequestClient(undefined, false).basket.removeItemFromBasket({ guid, basketItemId: basketItemId });
        //     }
        // }
        const response = await fetchData(
            "/baskets/auth/api/v1/baskets/remove-item",
            { method: "DELETE", data: { guid, basketItemId: basketItemId } }
        );

        if (response && response.basket) {
            setBasket(response.basket);
        }
    }

    return { addItemToBasket, removeItemFromBasket };
}

export default useBasket;