import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { FloatingActions } from '../../components/floating-actions';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW



type Candidate = {
  id: string;
  name: string;
  waist_number: number | null;
  gender: string;
  university_id: string;
  image_url: string | null;
};

export default function UniversityCandidates() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const insets = useSafeAreaInsets(); // NEW: place early to keep hook order stable
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const universityName = useMemo(() => (typeof name === 'string' ? name : ''), [name]);

  const offlineMessage = 'No internet connection. Please check and try again.';
  const formatError = (msg?: string) =>
    String(msg ?? '').toLowerCase().includes('network request failed')
      ? offlineMessage
      : 'Unable to load candidates. Please try again.';

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data: cand, error: candErr } = await supabase
        .from('candidates')
        .select('id, name, waist_number, gender, university_id, image_url')
        .eq('university_id', id as string)
        .ilike('gender', gender)
        .eq('is_active', true)
        .order('waist_number', { ascending: true });

      if (candErr) {
        setError(formatError(candErr.message));
        setCandidates([]);
      } else {
        setCandidates(cand ?? []);
      }
      setLoading(false);
    })();
  }, [id, gender, reloadKey]);

  // Voting window state
  const [votingStart, setVotingStart] = useState<Date | null>(null);
  const [votingEnd, setVotingEnd] = useState<Date | null>(null);
  const [countdownLabel, setCountdownLabel] = useState<string>('');

  // Fetch voting window for this university
  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('universities')
        .select('voting_start_at, voting_end_at')
        .eq('id', id as string)
        .single();

      if (!error && data) {
        setVotingStart(data.voting_start_at ? new Date(data.voting_start_at) : null);
        setVotingEnd(data.voting_end_at ? new Date(data.voting_end_at) : null);
      } else {
        setVotingStart(null);
        setVotingEnd(null);
      }
    })();
  }, [id]);

  // Live countdown ticker
  useEffect(() => {
    const formatRemaining = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${String(days).padStart(2, '0')} days ${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`;
    };

    const tick = () => {
      if (!votingStart || !votingEnd) {
        setCountdownLabel('Voting window unavailable');
        return;
      }
      const now = new Date();
      if (now < votingStart) {
        setCountdownLabel('Voting has not started');
      } else if (now > votingEnd) {
        setCountdownLabel('Voting is over');
      } else {
        setCountdownLabel(formatRemaining(votingEnd.getTime() - now.getTime()));
      }
    };

    tick(); // initial render
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [votingStart, votingEnd]);

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
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent', marginTop: 25 }}>
          <Text style={{ alignSelf: 'center', fontSize: 25, fontWeight: '800', color: 'white', letterSpacing: 0.3 }}>
            Choose Candidate
          </Text>
          <Text style={{ alignSelf: 'center', marginTop: 13, color: '#FFD700', fontSize: 15, fontWeight: 600 }}>
            {universityName ? `University : ${universityName}` : 'Select a person to view details'}
          </Text>
          {/* Countdown under university name */}
          <Text style={{ alignSelf: 'center', marginTop: 15, color: '#23fc93ff', fontSize: 15, fontWeight: 600 }}>
           [ {countdownLabel} ]
          </Text>

          {/* Gender tabs */}
          <View style={{ flexDirection: 'row', marginTop: 25 }}>
            <Pressable
              onPress={() => setGender('Male')}
              style={{
                flex: 1,
                backgroundColor: gender === 'Male' ? 'rgba(0, 0, 255, 0.3)' : 'rgba(255,255,255,0.2)',
                paddingVertical: 20,
                borderRadius: 20,
                marginRight: 8,
                borderColor: 'rgba(255,255,255,0.5)',
                borderWidth: 1,
                
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Male</Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('Female')}
              style={{
                flex: 1,
                backgroundColor: gender === 'Female' ? 'rgba(255, 0, 238, 0.4)' : 'rgba(255,255,255,0.2)',
                paddingVertical: 20,
                borderRadius: 20,
                marginLeft: 8,
                borderColor: 'rgba(255,255,255,0.5)',
                borderWidth: 1,
              }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Female</Text>
            </Pressable>
          </View>

          {/* List */}
          <View style={{ flex: 1, marginTop: 16 }}>
            {loading && (
              <View style={{ marginTop: 200 }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {error && (
              <View style={{ alignItems: 'center', marginTop: 25 }}>
                <Text style={{ color: 'rgba(255,255,255,0.95)' }}>{error}</Text>
                <Pressable
                  onPress={() => setReloadKey(k => k + 1)}
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
                data={candidates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.5)',
                        borderRadius: 40,
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                        marginBottom: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        maxWidth: 600,
                        alignSelf: 'center',
                        
                        // shadowColor: '#000',
                        // shadowOpacity: 0.08,
                        // shadowRadius: 10,
                        // shadowOffset: { width: 0, height: 6 },
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                    onPress={() => {
                      router.push({
                        pathname: '/candidate/[id]',
                        params: { id: item.id },
                      });
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                      {/* Avatar */}
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={{ width: 50, height: 50, borderRadius: 30, marginRight: 12 }}
                        />
                      ) : (
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
                          <Text style={{ fontSize: 22 }}>👤</Text>
                        </View>
                      )}

                      {/* Name + Waist number */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, color: '#FFD700', fontFamily: 'Inter_600SemiBold' }}>
                          {item.name}
                        </Text>
                        {/* {item.waist_number != null && (
                          <Text style={{ marginTop: 4, color: '#6b7280' }}>No. {item.waist_number}</Text>
                        )} */}
                      </View>
                    </View>

                    {/* Right-side number pill */}
                    <View
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: 30,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 400, color: '#ffffffff' }}>
                        {item.waist_number ?? '—'}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
        {/* Floating actions button (gear) */}
        <FloatingActions
          style={{
            right: 12,
            bottom: 84,
            top: undefined,
            transform: [{ translateY: -200 }],
            zIndex: 200,
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}