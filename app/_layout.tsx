import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import { useEffect, useRef } from "react";
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { posthog } from '@/src/config/posthog';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.');
}

SplashScreen.preventAutoHideAsync();

function ClerkIdentityBridge() {
  const { user } = useUser();
  const ph = usePostHog();

  useEffect(() => {
    if (user?.id) {
      const setProps: Record<string, string> = {};
      if (user.fullName) setProps.name = user.fullName;
      if (user.primaryEmailAddress?.emailAddress) setProps.email = user.primaryEmailAddress.emailAddress;

      const setOnceProps: Record<string, string> = {};
      if (user.createdAt) setOnceProps.created_at = user.createdAt.toISOString();

      ph.identify(user.id, { $set: setProps, $set_once: setOnceProps });
    }
    // ph is a stable PostHog instance; we intentionally re-identify only on user id change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf')
  });

  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ['testID'],
          maxElementsCaptured: 20,
        }}
      >
        <ClerkIdentityBridge />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </PostHogProvider>
    </ClerkProvider>
  );
}
