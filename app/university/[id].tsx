import { FloatingActions } from '@/components/floating-actions';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { fetchActiveCandidates, fetchActiveCategories, fetchActiveUniversities, Gender } from '../../lib/voting';

export default function UniversityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<Gender>('male');
  const [university, setUniversity] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      const unis = await fetchActiveUniversities();
      const u = unis.find((x) => x.id === id);
      const cats = await fetchActiveCategories(id as string);
      const cands = await fetchActiveCandidates(id as string, gender);
      if (!mounted) return;
      setUniversity(u ?? null);
      setCategories(cats);
      setCandidates(cands);
      setLoading(false);
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id, gender]);

  // Live countdown to voting_end_at
  useEffect(() => {
    if (!university?.voting_end_at) {
      setCountdown('');
      return;
    }
    const end = new Date(university.voting_end_at).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown(`${days} days ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} left`);
    }, 1000);
    return () => clearInterval(timer);
  }, [university?.voting_end_at]);

  const categoriesForGender = useMemo(
    () => categories.filter((c) => c.gender.toLowerCase() === gender),
    [categories, gender]
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#4D79FF', '#6C60E8', '#5E3DB7', '#4B2BD3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>Choose Candidate</Text>
          <Text style={{ marginTop: 6, color: '#FFE66D' }}>
            University : {university?.name ?? 'Unknown'}
          </Text>
          {countdown ? (
            <Text style={{ marginTop: 6, color: '#74E38F' }}>[ {countdown} ]</Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={() => setGender('male')}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 16,
                backgroundColor: gender === 'male' ? '#6C60E8' : 'rgba(255,255,255,0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Male</Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('female')}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 16,
                backgroundColor: gender === 'female' ? '#C34DCE' : 'rgba(255,255,255,0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Female</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/candidate/[id]',
                  params: { id: item.id, universityId: id as string, gender },
                })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            >
              <Image
                source={item.image_url ? { uri: item.image_url } : undefined}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.35)',
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFD54F' }}>
                  {item.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>#{item.waist_number}</Text>
              </View>

              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {item.waist_number}
                </Text>
              </View>
            </Pressable>
          )}
        />
        {/* Add the action button INSIDE the screen */}
        <FloatingActions style={{ top: '60%' }} />
      </SafeAreaView>
    </LinearGradient>
  );
}