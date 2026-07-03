import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import { AuthProvider, useAuth } from '@/context/AuthContext';

// Hold the native splash screen until fonts + saved auth are ready.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const isSignedIn = !!token;

  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    DMSans_400Regular,
    JetBrainsMono_500Medium,
  });

  // Reveal the app once auth is read and fonts either loaded or failed
  // (on failure we fall back to the system font rather than hanging on splash).
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  // Declarative auth gate: only the screens whose guard is true are reachable.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="predict/[fixtureId]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
