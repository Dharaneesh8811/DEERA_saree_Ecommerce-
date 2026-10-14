import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                    }
                  : item
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                ...product,
                quantity,
              },
            ],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.id !== productId
          ),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity: Math.max(1, quantity),
                }
              : item
          ),
        })),

      refreshCartPrices: (products) =>
        set((state) => {
          const productsById = new Map(
            products.map((product) => [String(product.id), product])
          );

          return {
            cartItems: state.cartItems.map((item) => {
              const product = productsById.get(String(item.id));
              if (!product) return item;

              return {
                ...item,
                price: Number(product.price),
                sellingPrice: Number(product.price),
                mrp: product.mrp == null ? null : Number(product.mrp),
                discount_percentage:
                  product.discount_percentage == null
                    ? null
                    : Number(product.discount_percentage),
              };
            }),
          };
        }),

      clearCart: () =>
        set({
          cartItems: [],
        }),
    }),
    {
      name: "dera-cart",
    }
  )
);