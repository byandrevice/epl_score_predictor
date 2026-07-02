import { View, Text, Button } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text>Profile</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
