import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalFn = useCartStore((state) => state.total);
  const itemCountFn = useCartStore((state) => state.itemCount);

  const total = totalFn();
  const itemCount = itemCountFn();
  const isEmpty = items.length === 0;

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isEmpty,
  };
}
