import { NavLink } from "react-router";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { useAtomValue } from "jotai";
import useBasket from "~/hooks/useBasket";
import { basketAtom } from "~/atoms/basketAtom";

export const OrderItems = () => {
  const basket = useAtomValue(basketAtom);
  const { removeItemFromBasket, basketTotalPrice } = useBasket();

  return (
    <div className="lg:col-span-2">
      <div className="rounded-lg border divide-y">
        {basket?.basketItems.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
          >
            <NavLink
              to={`/poster/${item.poster.id}`}
              className="block flex-shrink-0"
            >
              <img
                src={item.poster.posterImageUrl}
                alt={item.poster.posterImageUrl}
                className="w-24 h-24 object-cover rounded"
              />
            </NavLink>

            {/* Product Details */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                  <NavLink to={`/poster/${item.poster.id}`}>
                    <h3 className="font-medium hover:text-primary">
                      {item.poster.title}
                    </h3>
                  </NavLink>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.poster.artistFullName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.formatPrice.format}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <span className="font-medium">
                    kr. {(item.formatPrice.price * item.quantity).toFixed(2)},-
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
                {/* Quantity */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => console.log("Implement me")}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => console.log("IMplement me")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm h-8 px-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItemFromBasket(item.id)}
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" asChild>
          <NavLink to="/posters">Continue Shopping</NavLink>
        </Button>

        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => console.log("Implement me!")}
        >
          Clear basket
        </Button>
      </div>
    </div>
  );
};
