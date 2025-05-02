import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAtom } from "jotai";
import { cartAtom } from "~/atoms/cartAtom";
import { useAuth } from "@clerk/react-router";
import { useFetch } from "~/lib/api-client";
import type { BasketDto, BasketItemCreate } from "@realkoder/antik-moderne-shared-types";

const useCart = () => {
    const { fetchData } = useFetch<{ basket: BasketDto }>();
    const { userId } = useAuth();
    const [guid, setGuid] = useState<string | null>();
    const [cart, setCart] = useAtom(cartAtom);

    useEffect(() => {
        let localstorageGuid = localStorage.getItem("cartguid")
        if (!localstorageGuid) {
            const generatedGuid = uuidv4();
            localStorage.setItem("cartguid", generatedGuid);
        }
        setGuid(localstorageGuid);

        console.log("TRIGGERED", userId);

        if (cart && cart.userId === userId) return;
        (async () => {
            if (userId) {
                const response = await fetchData(
                    "/baskets/auth/api/v1/baskets",
                    { method: "POST", data: { guid: undefined } }
                );
                if (response) {
                    setCart(response.basket);
                }
            } else {
                if (localstorageGuid) {
                    const response = await fetchData(
                        "/baskets/auth/api/v1/baskets",
                        { method: "POST", data: { guid: localstorageGuid } }
                    );
                    if (response) {
                        setCart(response.basket);
                    }
                }
            }
        })();
    }, []);

    const addItemToCart = async (basketItemCreate: BasketItemCreate) => {

        // if (userId) {
        // response = await authRequestClient.basket.addItemToBasket({ basketItemCreate });
        const response = await fetchData(
            "/baskets/auth/api/v1/baskets/add-item",
            { method: "POST", data: { guid, basketItemCreate } }
        );
        // } else {
        //     if (guid) {
        //         response = await getRequestClient(undefined, false).basket.addItemToBasket({ guid, basketItemCreate });
        //     }
        // }

        if (response && response.basket) {
            setCart(response.basket);
        }
    }

    const removeItemFromCart = async (cartItemId: number) => {
        // let response;
        // if (userId) {
        //     if (!authRequestClient) return;
        //     response = await authRequestClient.basket.removeItemFromBasket({ basketItemId: cartItemId });
        // } else {
        //     const guid = localStorage.getItem("cartguid");
        //     if (guid) {
        //         response = await getRequestClient(undefined, false).basket.removeItemFromBasket({ guid, basketItemId: cartItemId });
        //     }
        // }
        const response = await fetchData(
            "/baskets/auth/api/v1/baskets/remove-item",
            { method: "DELETE", data: { guid, basketItemId: cartItemId } }
        );

        if (response && response.basket) {
            setCart(response.basket);
        }
    }

    return { addItemToCart, removeItemFromCart };
}

export default useCart;