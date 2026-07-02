import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Predict() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: string }>();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Predict fixture {fixtureId}</Text>
    </View>
  );
}
