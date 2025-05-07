import type { BasketItemDto } from "@realkoder/antik-moderne-shared-types";
import { MdRemoveCircle } from "react-icons/md";
import useBasket from "~/hooks/useBasket";

interface BasketItemProps {
  basketItem: BasketItemDto;
}

export const BasketItem = ({ basketItem }: BasketItemProps) => {
  const { removeItemFromBasket } = useBasket();
  console.log("NOW", basketItem);

  return (
    <div className="relative flex items-center justify-start w-full mt-2">
      <MdRemoveCircle
        onClick={() => removeItemFromBasket(basketItem.id)}
        className="absolute -left-1 -top-1 rounded-full w-4 h-4 text-red-500 cursor-pointer font-semibold z-50"
      />
      <img src={basketItem.poster.posterImageUrl} alt={basketItem.poster.title} className="rounded-md w-12 h-12" />
      <div className="flex flex-col items-start justify-start w-full ml-2">
        <h2 className="text-sm font-semibold">{basketItem.poster.title}</h2>
        <h2 className="text-sm">Format</h2>
        <h2 className="text-sm">{basketItem.poster.formatPrices.map(form => form.price).toString()}</h2>
      </div>
      {/* <p className="text-xs">Price {basketItem.poster.formatPrices[0]?.price || 0} DKK,-</p> */}
    </div>
  );
};
