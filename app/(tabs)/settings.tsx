import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

const settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const displayName = user?.firstName || user?.primaryEmailAddress?.emailAddress || 'there';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-background p-5'>
      <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
      <Text className="mt-1 text-base font-sans-medium text-muted-foreground">
        Signed in as {displayName}
      </Text>

      <View className="mt-8">
        <Pressable
          className={`auth-button ${signingOut ? 'auth-button-disabled' : ''}`}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="auth-button-text">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default settings
