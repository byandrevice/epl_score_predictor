import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootNavigator() {
  const { token } = useAuth();
  const isSignedIn = !!token;

  // Declarative auth gate: only the screens whose guard is true are reachable.
  // When the guard flips (sign in / sign out), Expo Router redirects for us —
  // no imperative router.replace(), so nothing navigates before the tree mounts.
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
