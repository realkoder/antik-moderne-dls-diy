import { useAtomValue } from "jotai";

import { basketAtom } from "~/atoms/basketAtom";
import { BasketItem } from "./BasketItem";

const Basket = () => {
  const basket = useAtomValue(basketAtom);

  return (
    <div className="flex flex-col items-start justify-start">
      <h1 className="text-lg">Basket</h1>
      <div className="border-b w-[95%] mb-2" />

      {basket?.basketItems && basket.basketItems.length < 1 && <p>no items</p>}

      {basket?.basketItems.map((basketItem) => (
        <BasketItem key={basketItem.id} basketItem={basketItem} />
      ))}

      <div className="border-b w-[95%] mb-2 mt-2" />

      <div className="w-full flex items-center justify-start">
        <button
          hidden={basket?.basketItems && basket?.basketItems.length < 1}
          className="border border-black  py-1 px-1.5 font-semibold drop-shadow-mg hover:cursor-pointer hover:scale-105 mt-2"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Basket;
