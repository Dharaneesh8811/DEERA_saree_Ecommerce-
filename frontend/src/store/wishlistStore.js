import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set) => ({
      wishlistItems: [],

      addToWishlist: (product) =>
        set((state) => {
          const alreadyExists = state.wishlistItems.some(
            (item) => item.id === product.id
          );

          if (alreadyExists) {
            return state;
          }

          return {
            wishlistItems: [...state.wishlistItems, product],
          };
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter(
            (item) => item.id !== productId
          ),
        })),

      toggleWishlist: (product) =>
        set((state) => {
          const alreadyExists = state.wishlistItems.some(
            (item) => item.id === product.id
          );

          if (alreadyExists) {
            return {
              wishlistItems: state.wishlistItems.filter(
                (item) => item.id !== product.id
              ),
            };
          }

          return {
            wishlistItems: [...state.wishlistItems, product],
          };
        }),

      clearWishlist: () =>
        set({
          wishlistItems: [],
        }),
    }),
    {
      name: "dera-wishlist",
    }
  )
);