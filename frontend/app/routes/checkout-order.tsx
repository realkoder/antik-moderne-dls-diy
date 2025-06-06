import { Separator } from "@radix-ui/react-select";
import { useAtomValue } from "jotai";
import { ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router";
import { basketAtom } from "~/atoms/basketAtom";
import { OrderItems } from "~/components/checkout-order/orderItems";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useBasket from "~/hooks/useBasket";
import useOrders from "~/hooks/useOrders";

export default function CheckoutOrder() {
  const basket = useAtomValue(basketAtom);
  const { basketTotalPrice } = useBasket();
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
        <OrderItems />

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
