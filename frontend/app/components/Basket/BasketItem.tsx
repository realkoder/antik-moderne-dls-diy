import type { BasketItemDto } from "@realkoder/antik-moderne-shared-types";
import { MdRemoveCircle } from "react-icons/md";
import useBasket from "~/hooks/useBasket";

interface BasketItemProps {
  basketItem: BasketItemDto;
}

export const BasketItem = ({ basketItem }: BasketItemProps) => {
  const { removeItemFromBasket } = useBasket();

  const selectedFormatPrice = basketItem.poster.formatPrices.find(
    (fp) => fp.id === basketItem.formatPrice.id
  );

  return (
    <div className="relative flex items-center w-full p-3 mb-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <button
        onClick={() => removeItemFromBasket(basketItem.id)}
        className="absolute top-2 left-2 text-red-500 hover:text-red-700"
        aria-label="Remove item"
      >
        <MdRemoveCircle size={22} />
      </button>
      <img
        src={basketItem.poster.posterImageUrl}
        alt={basketItem.poster.title}
        className="rounded-md w-16 h-16 object-cover border border-gray-100"
      />
      <div className="flex flex-col justify-between ml-4 flex-1">
        <span className="text-base font-semibold">
          {basketItem.poster.title}
        </span>
        <span className="text-xs text-gray-500">
          {basketItem.poster.artistFullName}
        </span>
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-700 mr-2">
            Format{" "}
            <span className="font-medium">{selectedFormatPrice?.format}</span>
          </span>
          <span className="text-sm text-gray-700 mr-2">
            Price{" "}
            <span className="font-medium">
              kr. {selectedFormatPrice?.price},-
            </span>
          </span>
          <span className="text-sm text-gray-700">
            Qty: <span className="font-medium">{basketItem.quantity}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
