import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENTLY_VIEWED = 8;

export const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      recentlyViewed: [],

      addRecentlyViewed: (product) =>
        set((state) => {
          if (!product?.id) {
            return state;
          }

          const withoutCurrent = state.recentlyViewed.filter(
            (item) => item.id !== product.id
          );

          return {
            recentlyViewed: [
              product,
              ...withoutCurrent,
            ].slice(0, MAX_RECENTLY_VIEWED),
          };
        }),

      removeRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: state.recentlyViewed.filter(
            (item) => item.id !== productId
          ),
        })),

      clearRecentlyViewed: () =>
        set({
          recentlyViewed: [],
        }),
    }),
    {
      name: "dera-recently-viewed",
    }
  )
);