import { FloatingActions } from '@/components/floating-actions';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW

type University = {
  id: string;
  name: string;
};

export default function Home() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Friendly error mapping
  const offlineMessage = 'No internet connection. Please check and try again.';
  const formatError = (msg?: string) =>
    String(msg ?? '').toLowerCase().includes('network request failed')
      ? offlineMessage
      : 'Unable to load data. Please try again.';

  async function loadUniversities() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setUniversities(data ?? []);
    } catch (e: any) {
      setError(formatError(e?.message));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log('Supabase URL present?', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key present?', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) {
        setError(error.message);
      } else {
        setUniversities(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const openUniversity = (u: University) => {
    router.push({ pathname: '/university/[id]', params: { id: u.id, name: u.name } });
  };

  const insets = useSafeAreaInsets(); // NEW

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Paint safe-area top and bottom */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#538df8ff',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: '#5B3DB5',
        }}
      />

      <LinearGradient
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']} // top→middle→bottom
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent', marginTop: 25 }}>
          <Text style={{ alignSelf: 'center', fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: 0.3 }}>
            King & Queen Voting
          </Text>
          <Text style={{ alignSelf: 'center', marginTop: 10, color: '#FFD700', fontSize: 13, fontWeight: 600 }}>
            Choose your university to start voting
          </Text>
          <View style={{ marginTop: 20, backgroundColor: 'transparent', flex: 1 }}>
            {loading && (
              <View style={{ marginTop: 200 }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {error && (
              <View style={{ alignItems: 'center', marginTop: 150 }}>
                <Text style={{ color: 'rgba(255,255,255,0.95)' }}>{error}</Text>
                <Pressable
                  onPress={loadUniversities}
                  style={{
                    marginTop: 30,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Retry</Text>
                </Pressable>
              </View>
            )}
            {!loading && !error && (
              <FlatList
                data={universities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => openUniversity(item)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.4)',
                        borderRadius: 40,
                        paddingVertical: 20,
                        paddingHorizontal: 25,
                        marginBottom: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        maxWidth: 600,
                        alignSelf: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#fff5db',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>🎓</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: 'rgba(235, 236, 249, 1)' }}>
                          {item.name}
                        </Text>
                        <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)' }}>
                          Tap to start voting
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconSymbol name="chevron.right" size={12} color="rgba(255,255,255,1)" />
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>

        {/* Floating actions button (gear) */}
        <FloatingActions />
      </LinearGradient>
    </SafeAreaView>
  );
}