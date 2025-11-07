// Top-level imports and types
import { FloatingActions } from '@/components/floating-actions';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';


type Row = {
  university_id: string;
  category_id: string;
  gender: string;
  type: string;
  candidate_id: string;
  waist_number: number | null;
  name: string;
  votes: number;
  image_url?: string | null; // optional if RPC already returns it
};

type CategoryGroup = {
  key: string; // gender-type
  label: string; // e.g., "Style — Male"
  candidates: Row[];
};

function getDisplayType(gender: string, type: string): string {
  const g = gender.toLowerCase();
  const t = type.toLowerCase();
  if (t === 'king') return g === 'female' ? 'Queen' : 'King';
  if (t === 'style') return 'Style';
  if (t === 'popular') return 'Popular';
  if (t === 'innocent') return 'Innocent';
  return type;
}

function getGenderLabel(gender: string): string {
  return gender?.toLowerCase() === 'female' ? 'Female' : 'Male';
}

export default function AdminResults() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string>('');
  const [imagesById, setImagesById] = useState<Record<string, string | null>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!university_id || !pw) {
          setError('Missing university ID or password');
          setLoading(false);
          return;
        }

        const { data: univData, error: univErr } = await supabase
          .from('universities')
          .select('name')
          .eq('id', university_id)
          .single();
        if (!univErr && univData?.name) setUniversityName(univData.name);

        const { data, error } = await supabase.rpc('get_admin_full_results_secure', {
          univ_id: university_id,
          plain_password: pw,
        });
        if (error) throw error;

        setRows((data ?? []) as Row[]);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load admin results');
      } finally {
        setLoading(false);
      }
    })();
  }, [university_id, pw]);

  // Fetch candidate images for all IDs present (if not already provided by RPC)
  useEffect(() => {
    (async () => {
      const ids = Array.from(new Set(rows.map(r => r.candidate_id)));
      if (ids.length === 0) return;

      // If rows already carry image_url, prefer them
      const prefilled: Record<string, string | null> = {};
      rows.forEach(r => {
        if (typeof r.image_url !== 'undefined') prefilled[r.candidate_id] = r.image_url ?? null;
      });

      // Fetch any missing ones from candidates
      const missing = ids.filter(id => !(id in prefilled));
      if (missing.length > 0) {
        const { data, error } = await supabase
          .from('candidates')
          .select('id, image_url')
          .in('id', missing);
        if (!error && Array.isArray(data)) {
          data.forEach((c: any) => {
            prefilled[c.id] = c.image_url ?? null;
          });
        }
      }

      setImagesById(prefilled);
    })();
  }, [rows]);

  // Group rows by gender-type and sort within each group by votes desc
  const grouped: CategoryGroup[] = useMemo(() => {
    const buckets = new Map<string, Row[]>();
    for (const r of rows) {
      const key = `${r.gender.toLowerCase()}-${r.type.toLowerCase()}`;
      const cur = buckets.get(key) ?? [];
      cur.push(r);
      buckets.set(key, cur);
    }
    for (const [key, items] of buckets.entries()) {
      items.sort((a, b) => (b.votes - a.votes) || a.candidate_id.localeCompare(b.candidate_id));
      buckets.set(key, items);
    }
    const order: string[] = [
      'male-king',
      'female-king',
      'male-style',
      'female-style',
      'male-popular',
      'female-popular',
      'male-innocent',
      'female-innocent',
    ];
    const toGroup = (key: string, items: Row[]): CategoryGroup => {
      const [g, t] = key.split('-');
      return {
        key,
        label: `${getDisplayType(g, t)} — ${getGenderLabel(g)}`,
        candidates: items,
      };
    };
    // Produce ordered groups; include any unexpected keys at the end
    const ordered: CategoryGroup[] = [];
    for (const k of order) {
      const it = buckets.get(k);
      if (it && it.length > 0) ordered.push(toGroup(k, it));
    }
    for (const [k, it] of buckets.entries()) {
      if (!order.includes(k) && it.length > 0) ordered.push(toGroup(k, it));
    }
    return ordered;
  }, [rows]);

  const renderCandidateItem = ({ item, index }: { item: Row; index: number }) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    const imageUrl = imagesById[item.candidate_id] ?? null;

    return (
      <View
        style={{
          backgroundColor: 'white',
          width: '100%',
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>{medal || `${index + 1}.`}</Text>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#eef2ff',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              borderWidth: 1,
              borderColor: '#d5dbff',
            }}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 16, color: '#333', fontWeight: '700' }}>
                {item.name?.charAt(0)?.toUpperCase() ?? '—'}
              </Text>
            )}
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#222' }}>{item.name}</Text>
            {item.waist_number !== null && (
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>#{item.waist_number}</Text>
            )}
          </View>
        </View>

        <View
          style={{
            minWidth: 40,
            height: 40,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: 'rgba(79,140,255,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '400', color: '#005fcc' }}>{item.votes}</Text>
        </View>
      </View>
    );
  };

  const renderCategorySection = ({ item }: { item: CategoryGroup }) => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 8 }}>
        {item.label}
      </Text>
      {item.candidates.length === 0 ? (
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
          No candidates in this category
        </Text>
      ) : (
        <View
          style={{
            backgroundColor: 'transparent',
            borderRadius: 20,
            padding: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0)',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <FlatList
            data={item.candidates}
            renderItem={renderCandidateItem}
            keyExtractor={(candidate) => candidate.candidate_id}
            scrollEnabled={false}
            contentContainerStyle={{ rowGap: 10 }}
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 16 }}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ffdddd', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <Pressable
            onPress={() => router.back()}
            style={{ backgroundColor: '#4f8cff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 , padding: 20, backgroundColor: 'transparent', marginTop: -10 }}>
          {/* Header */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: '#4f8cff', fontSize: 16 }}>Back to Dashboard</Text>
            </Pressable>
          </View> */}
          <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>All Rankings</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 }}>{universityName}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
            Total votes: {rows.reduce((sum, row) => sum + row.votes, 0)} • {grouped.length} categories
          </Text>
        </View>

        {/* Results */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10, paddingBottom: 96 }}>
          {grouped.length === 0 ? (
            <View style={{ padding: 0, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, textAlign: 'center' }}>
                No voting results available yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={grouped}
              renderItem={renderCategorySection}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>

        {/* Use default center-right placement */}
        <FloatingActions />
      </LinearGradient>
    </SafeAreaView>
  );
}