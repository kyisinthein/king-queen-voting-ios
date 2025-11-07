import { FloatingActions } from '@/components/floating-actions';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type University = { id: string; name: string };

export default function AdminLogin() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) setError(error.message);
      setUniversities(data ?? []);
      setSelected((data ?? [])[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  async function signIn() {
    if (!selected || !password) {
      setError('Please select a university and enter password.');
      return;
    }
    setVerifying(true);
    setError(null);
    const { data, error } = await supabase.rpc('admin_verify_password', {
      univ_id: selected,
      plain_password: password,
    });

    if (error) {
      setError(error.message);
      setVerifying(false);
      return;
    }
    if (!data) {
      setError('Invalid password.');
      setVerifying(false);
      return;
    }

    // Navigate to admin dashboard; pass password for secure RPC calls
    router.push({
      pathname: '/admin/dashboard',
      params: { university_id: selected, pw: password },
    });
    setVerifying(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent', marginTop: 25 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '800',
                color: 'white',
                textAlign: 'center',
                letterSpacing: 0.3,
              }}
            >
              Admin Login
            </Text>
            <Text style={{ marginTop: 15, color: 'white', opacity: 0.9, textAlign: 'center' }}>
              Select university and enter admin password
            </Text>
          </View>

          {/* Card form */}
          <View
            style={{
              backgroundColor: '#ffffff43',
              marginTop: 15,
              borderRadius: 20,
              paddingVertical: 25,
              paddingHorizontal: 25,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.31)',
              // shadowColor: '#000',
              // shadowOpacity: 0.08,
              // shadowRadius: 10,
              // shadowOffset: { width: 0, height: 6 },
              width: '100%',
              maxWidth: 460,
              alignSelf: 'center',
            }}
          >
            {loading && <ActivityIndicator color="#6a5acd" />}
            {error && <Text style={{ marginTop: 8, color: '#b00020' }}>{error}</Text>}
            {!loading && (
              <>
                <Text style={{ color: 'white', marginBottom: 8, fontWeight: '600' }}>University</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    columnGap: 8,
                    rowGap: 8,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderRadius: 16,
                    padding: 8,
                  }}
                >
                  {universities.map((u) => (
                    <Pressable
                      key={u.id}
                      onPress={() => setSelected(u.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: selected === u.id ? 'rgba(79,140,255,0)' : 'transparent',
                        borderWidth: 1,
                        borderColor: selected === u.id ? '#4fff81ff' : 'rgba(0,0,0,0)',
                      }}
                    >
                      <Text
                        style={{
                          color: selected === u.id ? '#4fff81ff' : '#222',
                          fontWeight: '700',
                        }}
                      >
                        {u.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: 'white', marginTop: 16, marginBottom: 8, fontWeight: '600' }}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Admin password"
                  placeholderTextColor="#999"
                  style={{
                    backgroundColor: '#f5f7ff',
                    color: '#111',
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: '#d5dbff',
                  }}
                />

                <Pressable
                  onPress={signIn}
                  disabled={verifying}
                  style={{
                    marginTop: 16,
                    backgroundColor: '#079540ff',
                    paddingVertical: 12,
                    borderRadius: 12,
                    opacity: verifying ? 0.7 : 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    alignSelf: 'center',
                    width: '50%',
                  }}
                >
                  <Text style={{ textAlign: 'center', color: 'white', fontWeight: '800' }}>
                    {verifying ? 'Verifying…' : 'Sign in'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Use default center-right placement */}
        <FloatingActions />
      </LinearGradient>
    </SafeAreaView>
  );
}