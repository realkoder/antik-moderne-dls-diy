import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAtom } from "jotai";
import { basketAtom } from "~/atoms/basketAtom";
import { useAuth } from "@clerk/react-router";
import { useFetch } from "~/lib/api-client";
import type { BasketDto, BasketItemCreate } from "@realkoder/antik-moderne-shared-types";

const useBasket = () => {
    const { fetchData } = useFetch<{ basket: BasketDto }>();
    const { userId } = useAuth();
    const [guid, setGuid] = useState<string | null>();
    const [basket, setBasket] = useAtom(basketAtom);

    useEffect(() => {
        let localstorageGuid = localStorage.getItem("basketguid")
        if (!localstorageGuid) {
            const generatedGuid = uuidv4();
            localStorage.setItem("basketguid", generatedGuid);
        }
        setGuid(localstorageGuid);

        if (basket && basket.userId === userId) return;
        (async () => {
            if (userId) {
                const response = await fetchData(
                    "/baskets/auth/api/v1/baskets",
                    { method: "POST", data: { guid: undefined } }
                );
                if (response) {
                    setBasket(response.basket);
                }
            } else {
                if (localstorageGuid) {
                    const response = await fetchData(
                        "/baskets/auth/api/v1/baskets",
                        { method: "POST", data: { guid: localstorageGuid } }
                    );

                    if (response) {
                        setBasket(response.basket);
                    }
                }
            }
        })();
    }, []);

    const addItemToBasket = async (basketItemCreate: BasketItemCreate) => {

        const response = await fetchData(
            "/baskets/auth/api/v1/baskets/add-item",
            { method: "PUT", data: { guid, basketItemCreate } }
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