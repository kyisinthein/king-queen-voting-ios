import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingActions } from '../components/floating-actions';
import { getDeviceId } from '../lib/device-id';
import { supabase } from '../lib/supabase';

type University = { id: string; name: string };
type MyVote = {
  category_id: string;
  category_gender: string;
  category_type: string;
  category_display_label: string | null;
  candidate_id: string;
  candidate_name: string;
  candidate_gender: string;
  candidate_waist_number: number;
  candidate_image_url: string | null;
  voted_at: string;
};

export default function MyVotes() {
  const insets = useSafeAreaInsets();
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<MyVote[]>([]);
  const [ticketsLeftTotal, setTicketsLeftTotal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: unis, error: uniErr } = await supabase
          .from('universities')
          .select('id, name')
          .eq('is_active', true)
          .order('name', { ascending: true });
        if (uniErr) throw new Error(uniErr.message);
        setUniversities(unis ?? []);
        const first = (unis ?? [])[0]?.id ?? null;
        setSelectedUniversityId(first);
      } catch (e: any) {
        setError(String(e?.message ?? 'Failed to load universities'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedUniversityId) return;
      try {
        setLoading(true);
        setError(null);
        const deviceId = await getDeviceId();
        const { data, error } = await supabase.rpc('get_device_votes', {
          univ_id: selectedUniversityId,
          p_device_id: deviceId,
        });
        if (error) throw new Error(error.message);
        setVotes(Array.isArray(data) ? (data as MyVote[]) : []);
      } catch (e: any) {
        setError(String(e?.message ?? 'Failed to load your votes'));
        setVotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUniversityId]);

  useEffect(() => {
    (async () => {
      if (!selectedUniversityId) return;
      try {
        const deviceId = await getDeviceId();
        const { data, error } = await supabase.rpc('get_device_ticket_usage', {
          univ_id: selectedUniversityId,
          p_device_id: deviceId,
        });
        if (error) return;
        const rows = Array.isArray(data) ? (data as any[]) : [];
        const total = rows.reduce((sum, r) => sum + (Number(r?.remaining_tickets) || 0), 0);
        setTicketsLeftTotal(total);
      } catch {}
    })();
  }, [selectedUniversityId]);

  const selectedUniversityName = useMemo(() => {
    const found = universities.find(u => u.id === selectedUniversityId);
    return found?.name ?? '';
  }, [universities, selectedUniversityId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: '#538df8ff' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: '#6a30db' }} />
      <LinearGradient
        colors={['#538df8ff', '#6a30db']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: 96 + insets.bottom }}
        >
          <View style={{ alignItems: 'center', marginTop: -10 }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: 'white' }}>My Votes</Text>
            {/* <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.85)' }}>{selectedUniversityName}</Text> */}
            {typeof ticketsLeftTotal === 'number' && (
              <View style={{ marginTop: 12, alignSelf: 'center' }}>
                <View
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0)',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Tickets left: {ticketsLeftTotal}</Text>
                </View>
              </View>
            )}
          </View>

          {/* University selector */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8 }}>
              {universities.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setSelectedUniversityId(u.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: selectedUniversityId === u.id ? 'rgba(255,255,255,0.22)' : 'transparent',
                    borderWidth: 1,
                    borderColor: selectedUniversityId === u.id ? 'rgba(255,255,255,0.45)' : 'transparent',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>{u.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {loading && (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}

          {error && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: '#ffdddd' }}>{error}</Text>
            </View>
          )}

          {!loading && !error && votes.length === 0 && (
            <View style={{ marginTop: 30, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                You have not voted yet.
              </Text>
              <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                Cast votes on a candidate to see them here.
              </Text>
            </View>
          )}

          {!loading && !error && votes.length > 0 && (
            <View style={{ marginTop: 16, rowGap: 12 }}>
              {votes.map((v, idx) => {
                const type = String(v.category_type).toLowerCase();
                const colors =
                  type === 'king'
                    ? { bg: 'rgba(255,215,0,0.18)', border: '#FFD700', text: '#7c5e00' }
                    : type === 'style'
                    ? { bg: 'rgba(106,90,205,0.18)', border: '#b2a7ff', text: '#3e36a3' }
                    : type === 'popular'
                    ? { bg: 'rgba(255,105,180,0.18)', border: '#ffb3d6', text: '#8a3063' }
                    : type === 'innocent'
                    ? { bg: 'rgba(64,224,208,0.18)', border: '#a5ece5', text: '#0f6b64' }
                    : { bg: 'rgba(0,0,0,0.08)', border: 'transparent', text: '#333' };
                const genderIcon = (v.category_gender || '').toLowerCase() === 'female' ? '♀' : '♂';
                const label = (v.category_display_label?.trim() || v.category_type).toString();

                return (
                  <Pressable
                    key={`${v.category_id}:${v.candidate_id}:${v.voted_at}`}
                    onPress={() => supabase && (supabase as any) && (typeof label === 'string') && null}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.16)',
                      borderRadius: 40,
                      paddingVertical: 20,
                      paddingHorizontal: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.35)',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 6 },
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.45)',
                        }}
                      >
                        {v.candidate_image_url ? (
                          <Image source={{ uri: v.candidate_image_url }} style={{ width: 55, height: 55, borderRadius: 27.5 }} />
                        ) : (
                          <Text style={{ fontSize: 16, color: '#294aa6', fontWeight: '700' }}>
                            {v.candidate_name?.charAt(0)?.toUpperCase() ?? '—'}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 7 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFD700' }}>{v.candidate_name}</Text>
                        <View style={{ marginTop: 12 }}>
                          <View
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              backgroundColor: 'rgba(255,255,255,0.21)',
                              borderWidth: 1,
                              borderColor: colors.border,
                              alignSelf: 'flex-start',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                              {genderIcon} {label}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.45)',
                        }}
                      >
                        <Text style={{ fontWeight: '700', color: '#fff' }}>{v.candidate_waist_number ?? '—'}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <FloatingActions />
      </LinearGradient>
    </SafeAreaView>
  );
}
