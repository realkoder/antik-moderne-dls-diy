import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { basketAtom } from "~/atoms/basketAtom";
import Basket from "./Basket";

import { MemoryRouter } from "react-router";

describe("Basket", () => {
  it("Should render no items if basket is empty", () => {
    const store = createStore();
    store.set(basketAtom, {
      id: 1,
      userId: "test-user",
      guid: "test-guid",
      createdAt: new Date(),
      updatedAt: new Date(),
      basketItems: [],
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Basket />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/no items/i)).toBeDefined();
  });
});
