import { View, Text, Button } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text>Login</Text>
      {/* Temporary dev shortcut — replaced by the real login form later. */}
      <Button title="Dev sign in" onPress={() => signIn('mock-jwt-token')} />
    </View>
  );
}
