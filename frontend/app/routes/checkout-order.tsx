import { Separator } from "@radix-ui/react-select";
import { useAtomValue } from "jotai";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash,
} from "lucide-react";
import { NavLink } from "react-router";
import { basketAtom } from "~/atoms/basketAtom";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useBasket from "~/hooks/useBasket";
import useOrders from "~/hooks/useOrders";

export default function CheckoutOrder() {
  const basket = useAtomValue(basketAtom);
  const { removeItemFromBasket, basketTotalPrice } = useBasket();
  const { createOrder } = useOrders();

  if (basket && basket.basketItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            Looks like you haven't added any posters to your basket yet.
          </p>
          <Button asChild>
            <NavLink to="/posters" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </NavLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Shopping Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basket Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border divide-y">
            {basket?.basketItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
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

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>kr. {basketTotalPrice.toFixed(2)},-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>kr. {basketTotalPrice.toFixed(2)},-</span>
            </div>

            <Button className="w-full gap-2" onClick={() => createOrder()}>
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center text-xs text-muted-foreground mt-4">
              Taxes and shipping calculated at checkout
            </div>

            {/* Promo Code */}
            <div className="pt-4 mt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Promo Code</h3>
              <div className="flex gap-2">
                <Input placeholder="Enter code" className="flex-1" />
                <Button variant="outline">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
