import { FloatingActions } from '@/components/floating-actions';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Text } from 'react-native';

export default function ResultsScreen() {
  return (
    <LinearGradient colors={['#4D79FF', '#4B2BD3']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>Live Results</Text>
        <Text style={{ marginTop: 12, color: '#fff' }}>Live aggregates coming next.</Text>
        <FloatingActions />
      </SafeAreaView>
    </LinearGradient>
  );
}