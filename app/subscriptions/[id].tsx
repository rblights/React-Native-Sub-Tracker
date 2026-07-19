import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { usePostHog } from 'posthog-react-native';

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('subscription_detail_viewed', { subscription_id: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <View>
      <Text>Subscription Details: {id}</Text>

    </View>
  )
}

export default SubscriptionDetails