import { useAtomValue } from "jotai";

import { basketAtom } from "~/atoms/basketAtom";
import { BasketItem } from "./BasketItem";
import { NavLink } from "react-router";
import { ShoppingBag } from "lucide-react";

const Basket = () => {
  const basket = useAtomValue(basketAtom);

  return (
    <div className="flex flex-col items-start justify-start">
      <div className="w-full flex justify-center m-2">
        <NavLink
          className="flex space-x-3 border border-black rounded p-1"
          hidden={basket?.basketItems && basket?.basketItems.length < 1}
          to="/checkout-order"
        >
          <p>Checkout</p>
          <ShoppingBag />
        </NavLink>
      </div>
      <div className="border-b w-[95%] mb-2" />

      {basket?.basketItems && basket.basketItems.length < 1 && <p>no items</p>}

      {basket?.basketItems.map((basketItem) => (
        <BasketItem key={basketItem.id} basketItem={basketItem} />
      ))}

      <div className="border-b w-[95%] mb-2 mt-2" />
    </div>
  );
};

export default Basket;
