import { CartProvider, useCart } from "@/context/CartContext";
import { CART_STORAGE_KEY, type CartLine } from "@/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const lineA: Omit<CartLine, "quantity"> = {
  productId: "1",
  name: "طاجين فخار",
  price: 12_500,
  imageUrl: null,
};
const lineB: Omit<CartLine, "quantity"> = {
  productId: "2",
  name: "زربية",
  price: 30_000,
  imageUrl: null,
};

/** A tiny consumer that exposes the cart API through buttons and text. */
function CartProbe() {
  const {
    lines,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  return (
    <div>
      <output data-testid="count">{itemCount}</output>
      <output data-testid="subtotal">{subtotal}</output>
      <output data-testid="lines">
        {lines.map((line) => `${line.productId}:${line.quantity}`).join(",")}
      </output>
      <button type="button" onClick={() => addItem(lineA, 2)}>
        add-a
      </button>
      <button type="button" onClick={() => addItem(lineB)}>
        add-b
      </button>
      <button type="button" onClick={() => updateQuantity("1", 5)}>
        set-a-5
      </button>
      <button type="button" onClick={() => updateQuantity("1", 0)}>
        zero-a
      </button>
      <button type="button" onClick={() => removeItem("2")}>
        remove-b
      </button>
      <button type="button" onClick={() => clearCart()}>
        clear
      </button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartProbe />
    </CartProvider>,
  );
}

describe("CartContext", () => {
  it("starts empty with a zero subtotal", () => {
    renderCart();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("0");
  });

  it("adds items, accumulates quantity and computes the subtotal", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "add-a" }));
    await user.click(screen.getByRole("button", { name: "add-b" }));

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    // 2 × 12500 + 1 × 30000 = 55000 centimes
    expect(screen.getByTestId("subtotal")).toHaveTextContent("55000");
    expect(screen.getByTestId("lines")).toHaveTextContent("1:2,2:1");
  });

  it("merges a repeated add into the existing line", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "add-a" }));
    await user.click(screen.getByRole("button", { name: "add-a" }));

    expect(screen.getByTestId("lines")).toHaveTextContent("1:4");
    expect(screen.getByTestId("count")).toHaveTextContent("4");
  });

  it("updates a line quantity and removes the line at zero", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "add-a" }));
    await user.click(screen.getByRole("button", { name: "set-a-5" }));
    expect(screen.getByTestId("lines")).toHaveTextContent("1:5");

    await user.click(screen.getByRole("button", { name: "zero-a" }));
    expect(screen.getByTestId("lines")).toHaveTextContent("");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("removes a specific line and clears the whole cart", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole("button", { name: "add-a" }));
    await user.click(screen.getByRole("button", { name: "add-b" }));
    await user.click(screen.getByRole("button", { name: "remove-b" }));
    expect(screen.getByTestId("lines")).toHaveTextContent("1:2");

    await user.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists the cart to localStorage and restores it on remount", async () => {
    const user = userEvent.setup();
    const first = renderCart();

    await user.click(screen.getByRole("button", { name: "add-a" }));
    await user.click(screen.getByRole("button", { name: "add-b" }));

    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored as string).lines).toHaveLength(2);

    // Simulate a page refresh: unmount and mount a fresh provider.
    first.unmount();
    renderCart();

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("55000");
    expect(screen.getByTestId("lines")).toHaveTextContent("1:2,2:1");
  });

  it("ignores a corrupt persisted payload instead of crashing", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{not json");
    renderCart();
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("drops persisted lines with a non-positive quantity", () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        lines: [
          { ...lineA, quantity: 0 },
          { ...lineB, quantity: 2 },
        ],
      }),
    );
    renderCart();
    expect(screen.getByTestId("lines")).toHaveTextContent("2:2");
  });

  it("throws when useCart is used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CartProbe />)).toThrow(
      /useCart must be used inside a CartProvider/,
    );
    spy.mockRestore();
  });
});
