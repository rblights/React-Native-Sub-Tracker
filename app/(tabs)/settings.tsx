import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from 'react';
import { ActivityIndicator, Pressable, Text, View, Image } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from '@/constants/images';

const SafeAreaView = styled(RNSafeAreaView)

const settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const displayName = user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';
  const email = user?.emailAddresses[0]?.emailAddress;

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

      <View className="auth-card mb-5">
        <View className="flex-row items-center gap-4 mb-4">
          <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="size-16 rounded-full"
          />
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-primary">{displayName}</Text>
            {email && (
                <Text className="text-sm font-sans-medium text-muted-foreground">{email}</Text>
            )}
          </View>
        </View>
      </View>

      <View className="auth-card mb-5">
        <Text className="text-base font-sans-semibold text-primary mb-3">Account</Text>
        <View className="gap-2">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">Account ID</Text>
            <Text className="text-sm font-sans-medium text-primary" numberOfLines={1} ellipsizeMode="tail">
              {user?.id?.substring(0, 20)}...
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">Joined</Text>
            <Text className="text-sm font-sans-medium text-primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

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
