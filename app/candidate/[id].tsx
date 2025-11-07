// imports
import { Image } from 'expo-image'; // switched to expo-image
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW
import { FloatingActions } from '../../components/floating-actions';
import { getDeviceId } from '../../lib/device-id';
import { supabase } from '../../lib/supabase';

type Candidate = {
  id: string;
  name: string;
  waist_number: number | null;
  gender: string;
  university_id: string;
  height_cm: number | null;
  birthday: string | null; // ISO string from Postgres
  hobby: string | null;
  image_url: string | null;
};

type Category = {
  id: string;
  type: string;
  gender: string;
};

export default function CandidateDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets(); // moved here to keep hook order stable
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ticketsLeft, setTicketsLeft] = useState<number | null>(null);
  const [prevNeighborId, setPrevNeighborId] = useState<string | null>(null);
  const [nextNeighborId, setNextNeighborId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, waist_number, gender, university_id, height_cm, birthday, hobby, image_url')
        .eq('id', id as string)
        .limit(1)
        .single();

      if (error) {
        setError(error.message);
        setCandidate(null);
      } else {
        setCandidate(data as Candidate);
        
        // Fetch available categories for this candidate's university and gender
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, type, gender')
          .eq('university_id', data.university_id)
          .ilike('gender', data.gender)
          .eq('is_active', true);
        if (categoriesError) {
          setError(categoriesError.message);
          setCategories([]);
        } else {
          setCategories(categoriesData ?? []);
        }
      }

      setLoading(false);
    })();
  }, [id]);

  // Replace direct vote with: open modal and fetch tickets left
  async function handleVoteButtonPress() {
    if (!candidate || categories.length === 0) {
      setError('No voting categories available for this candidate.');
      return;
    }
    setError(null);
  
    try {
      const deviceId = await getDeviceId();
      const { data, error } = await supabase.rpc('get_device_ticket_usage', {
        univ_id: candidate.university_id,
        p_device_id: deviceId, // renamed param
      });
  
      if (error) throw error;
  
      const genderKey = candidate.gender.toLowerCase();
      const row = Array.isArray(data)
          ? (data as any[]).find((r) => String(r.gender).toLowerCase() === genderKey)
          : null;
  
      setTicketsLeft(row ? row.remaining_tickets : 0);
      setSelectedCategory(null);
      setShowCategoryModal(true);
    } catch (e: any) {
      setError(e.message ?? 'Unable to load ticket info.');
    }
  }

  // In CandidateDetails component: update submitVote()
  async function submitVote() {
    if (!candidate || !selectedCategory) return;
    setVoting(true);
    setError(null);
  
    try {
      const deviceId = await getDeviceId();
  
      const { error: voteErr } = await supabase
        .from('votes')
        .insert({
          university_id: candidate.university_id,
          category_id: selectedCategory,
          candidate_id: candidate.id,
          device_id: deviceId,
        });
  
      if (voteErr) {
        throw voteErr;
      }
  
      setShowCategoryModal(false);
      Alert.alert('Voted 🗳️', 'သင်ရွေးချယ်သောသူ အနိုင်ရမယ်လို့ မျှော်လင့်ပါတယ် 🍀');
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      const code = e?.code ?? e?.data?.code;
  
      // Map unique constraint violation to a friendly message
      if (code === '23505' || msg.includes('duplicate key value')) {
        setError('‼️ You have already voted for this category. ‼️');
        // If you prefer Burmese:
        // setError('ဤအမျိုးအစားတွင် သင့်စက်မှ မဲပေးပြီးသားဖြစ်ပါသည်။');
      } else {
        setError('Unable to cast vote. Please try again.');
      }
    } finally {
      setVoting(false);
    }
  }

  function getCategoryDisplayName(type: string): string {
    // Feel free to rename 'popular' to 'Popular' for UI:
    switch (type) {
      case 'king': return candidate?.gender.toLowerCase() === 'male' ? 'King' : 'Queen';
      case 'style': return candidate?.gender.toLowerCase() === 'male' ? 'Style' : 'Style';
      case 'popular': return 'Popular'; // UI label; DB type stays 'popular'
      case 'innocent': return 'Innocent';
      default: return type;
    }
  }

  // Move neighbor lookup ABOVE early returns to keep hook order stable
  async function findNeighbor(direction: 'next' | 'prev') {
    if (!candidate || candidate.waist_number == null) return null;

    const isNext = direction === 'next';
    const { data, error } = await supabase
      .from('candidates')
      .select('id, waist_number')
      .eq('university_id', candidate.university_id)
      .ilike('gender', candidate.gender)
      .eq('is_active', true)
      [isNext ? 'gt' : 'lt']('waist_number', candidate.waist_number)
      .order('waist_number', { ascending: isNext })
      .limit(1);

    if (error) return null;
    const row = Array.isArray(data) ? data[0] : null;
    return row?.id ?? null;
  }

  // Compute neighbors BEFORE any early returns (Rules of Hooks)
  useEffect(() => {
    if (!candidate || candidate.waist_number == null) {
      setPrevNeighborId(null);
      setNextNeighborId(null);
      return;
    }

    let canceled = false;
    (async () => {
      const prevId = await findNeighbor('prev');
      const nextId = await findNeighbor('next');
      if (!canceled) {
        setPrevNeighborId(prevId);
        setNextNeighborId(nextId);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [
    candidate?.id,
    candidate?.waist_number,
    candidate?.university_id,
    candidate?.gender,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#538df8ff', '#6a30db']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator color="white" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!candidate) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#538df8ff', '#6a30db']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Candidate not found</Text>
          {error && <Text style={{ marginTop: 8, color: 'white', opacity: 0.8 }}>{error}</Text>}
        </LinearGradient>
      </SafeAreaView>
    );
  }

  async function goPrev() {
    if (!prevNeighborId) return; // disabled: do nothing
    router.push(`/candidate/${prevNeighborId}`);
  }

  async function goNext() {
    if (!nextNeighborId) return; // disabled: do nothing
    router.push(`/candidate/${nextNeighborId}`);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          backgroundColor: '#6a30db',
        }}
      />
      <LinearGradient
        colors={['#538df8ff', '#6a30db']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
       
        <View style={{ flex: 1, padding: 20, paddingBottom: 110, backgroundColor: 'transparent' }}>
          <View
            style={{
              marginTop: 20,
              backgroundColor: 'white',
              
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              overflow: 'hidden',
              marginBottom: 16,
              position: 'relative',
              borderWidth: 3,
              borderColor: 'rgba(0,0,0,0.06)',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            {candidate.image_url ? (
              <View style={{ overflow: 'hidden', height: 250 }}>
                <Image
                  source={{ uri: candidate.image_url }}
                  style={{ 
                    width: '100%', 
                    height: 300, 
                    marginTop: -50, 
                    
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                  contentFit="cover"
                  contentPosition="top center"
                />
              </View>
            ) : (
              <View style={{ width: '100%', height: 250, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#666' }}>No photo</Text>
              </View>
            )}

            {/* Back button << */}
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.95)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <Text style={{ fontWeight: '800', fontSize: 15 }}>{'‹‹'}</Text>
            </Pressable>

            {/* Waist number badge */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.95)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <Text style={{ fontWeight: '700' }}>{candidate.waist_number ?? '—'}</Text>
            </View>

            {/* Full image button [ ] */}
            <Pressable
              onPress={() => candidate.image_url && setImageExpanded(true)}
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.06)',
                opacity: candidate.image_url ? 1 : 0.6,
              }}
            >
              <Text style={{ fontWeight: '700' }}>[ ]</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 25, fontWeight: '600', color: 'white', marginTop: 7, marginBottom: 8, letterSpacing: 0.3, textAlign: 'center' }}>
            {candidate.name}
          </Text>

          {/* Info pills: 2x2 grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 15, }}>
            <InfoPill title="Height" value={candidate.height_cm ? `${candidate.height_cm} ` : '—'} />
            <InfoPill title="Birthday" value={candidate.birthday ? formatDate(candidate.birthday) : '—'} />
            <InfoPill title="Age" value={candidate.birthday ? `${computeAge(candidate.birthday)} ` : '—'} />
            <InfoPill title="Hobby" value={candidate.hobby || '—'} />
          </View>

          {error && <Text style={{ marginTop: 12, color: '#ffdddd' }}>{error}</Text>}

          {/* Bottom controls: unified floating pill */}
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 60, alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 40,
                paddingVertical: 8,
                paddingHorizontal: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {/* Keep your three Pressables inside this wrapper */}
              <Pressable
                onPress={goPrev}
                disabled={!prevNeighborId}
                hitSlop={10}
                style={({ pressed }) => [
                  {
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    borderColor: 'rgba(255, 255, 255, 0)',
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    opacity: prevNeighborId ? 1 : 0.2,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text style={{ color: 'white', fontSize: 30, fontWeight: '800' }}>{'‹‹'}</Text>
              </Pressable>

              <Pressable
                onPress={handleVoteButtonPress}
                disabled={voting}
                hitSlop={10}
                style={({ pressed }) => [
                  {
                    backgroundColor: '#515cfbff',
                    paddingVertical: 20,
                    paddingHorizontal: 32,
                    borderRadius: 30,
                    opacity: voting ? 0.7 : 1,
                    shadowColor: '#8440ebff',
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0)',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>
                  Vote
                </Text>
              </Pressable>

              <Pressable
                onPress={goNext}
                disabled={!nextNeighborId}
                hitSlop={10}
                style={({ pressed }) => [
                  {
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255,255,255,0)',
                    borderColor: 'rgba(255, 255, 255, 0)',
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    opacity: nextNeighborId ? 1 : 0.4,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text style={{ color: 'white', fontSize: 30, fontWeight: '800' }}>{'››'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Floating actions button (gear) */}
        <FloatingActions
          style={{
            right: 12,
            bottom: 84,
            top: undefined,
            transform: [{ translateY: -310 }],
            zIndex: 200,
          }}
        />

        {/* Full-screen image overlay */}
        {imageExpanded && candidate.image_url && (
          <Pressable
            onPress={() => setImageExpanded(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={{ uri: candidate.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              
            />
          </Pressable>
        )}

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onPress={() => setShowCategoryModal(false)}
          >
            <Pressable
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 320,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 10,
              }}
              onPress={(e) => e.stopPropagation()} // Prevent modal from closing when tapping inside
            >
              <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 }}>
                Select Category
              </Text>
              <Text style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
                Tickets left: {ticketsLeft ?? '...'}
              </Text>
              
              {/* Category grid (2x2) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    disabled={(ticketsLeft ?? 0) <= 0}
                    style={{
                      width: '48%',
                      backgroundColor: selectedCategory === category.id ? '#e0f0ff' : '#f5f5f5',
                      paddingVertical: 14,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: selectedCategory === category.id ? '#4f8cff' : '#f5f5f5',
                      opacity: (ticketsLeft ?? 0) <= 0 ? 0.6 : 1,
                    }}
                  >
                    <Text style={{
                      color: selectedCategory === category.id ? '#005fcc' : '#333',
                      fontSize: 15,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}>
                      {getCategoryDisplayName(category.type)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {error && (
                <Text style={{ color: 'red', fontSize: 14, textAlign: 'center', marginTop: 12, marginBottom: 4 }}>
                  {error}
                </Text>
              )}

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
                <Pressable
                  onPress={() => setShowCategoryModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f5f5f5',
                    paddingVertical: 14,
                    borderRadius: 16,
                  }}
                >
                  <Text style={{ color: '#666', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                    Cancel
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={submitVote}
                  disabled={!selectedCategory || voting || (ticketsLeft ?? 0) <= 0}
                  style={{
                    flex: 1,
                    backgroundColor: selectedCategory && !voting && (ticketsLeft ?? 0) > 0 ? '#4f8cff' : '#ccc',
                    paddingVertical: 14,
                    borderRadius: 16,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                    {voting ? 'Voting...' : 'Vote'}
                  </Text>
                </Pressable>

                
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function InfoPill({ title, value }: { title: string; value: string }) {
  return (
    <View
      style={{
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Text style={{ color: '#FFD700', fontSize: 13, fontWeight: '400', textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 10 }}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Text style={{ color: 'white', opacity: 0.9, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: 'white', fontWeight: '700', marginTop: 4, fontSize: 16 }}>{value}</Text>
    </View>
  );
}

function computeAge(iso: string) {
  try {
    let y = 0, m = 0, d = 0;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yy, mm, dd] = iso.split('-').map((v) => parseInt(v, 10));
      y = yy; m = mm; d = dd;
    } else {
      const dt = new Date(iso);
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }

    const birthUTC = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let age = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
    const beforeBirthday =
      todayUTC.getUTCMonth() < birthUTC.getUTCMonth() ||
      (todayUTC.getUTCMonth() === birthUTC.getUTCMonth() && todayUTC.getUTCDate() < birthUTC.getUTCDate());

    if (beforeBirthday) age -= 1;
    return Math.max(age, 0);
  } catch {
    return 0;
  }
}

function formatDate(iso: string) {
  try {
    let y = 0, m = 0, d = 0;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yy, mm, dd] = iso.split('-').map((v) => parseInt(v, 10));
      y = yy; m = mm; d = dd;
    } else {
      const dt = new Date(iso);
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = String(d).padStart(2, '0');
    const mon = months[m - 1] ?? String(m).padStart(2, '0');
    return `${day} ${mon} ${y}`;
  } catch {
    return iso;
  }
}