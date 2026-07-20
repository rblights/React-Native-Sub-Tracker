import { HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from '@/constants/data'; // Import both
import { create } from 'zustand';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  // Combine both arrays for initial state
  subscriptions: [...HOME_SUBSCRIPTIONS, ...UPCOMING_SUBSCRIPTIONS],
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
}));