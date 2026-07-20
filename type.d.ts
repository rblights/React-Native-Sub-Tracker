import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    export interface Subscription {
        id: string;
        icon: any;
        name: string;
        price: number;
        currency?: string;
        renewalDate?: string;
        status: 'active' | 'paused' | 'cancelled'; // Use union types for safety
        // Make these optional if they don't exist for every type of subscription
        frequency?: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        startDate?: string;
        billing?: string; // Optional because upcoming subs might not have this yet
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }
}

export { };

