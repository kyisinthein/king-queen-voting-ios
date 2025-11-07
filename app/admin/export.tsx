import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

function toCSV<T extends Record<string, any>>(rows: T[], headers: Array<{ key: keyof T; label: string }>): string {
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const headerLine = headers.map(h => esc(h.label)).join(',');
  const dataLines = rows.map(r => headers.map(h => esc(r[h.key])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export default function AdminExport() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ results: number; candidates: number; categories: number; votes: number }>({
    results: 0, candidates: 0, categories: 0, votes: 0,
  });

  useEffect(() => {
    (async () => {
      if (!university_id || !pw) return;
      try {
        setLoading(true);
        setError(null);

        const [resAgg, resCand, resCat, resVotes] = await Promise.all([
          supabase.rpc('get_admin_full_results_secure', { univ_id: university_id, plain_password: pw }),
          supabase.rpc('admin_list_candidates_secure', { univ_id: university_id, plain_password: pw }),
          supabase.rpc('admin_list_categories_secure', { univ_id: university_id, plain_password: pw }),
          supabase.rpc('admin_export_votes_secure', { univ_id: university_id, plain_password: pw }),
        ]);
        if (resAgg.error) throw resAgg.error;
        if (resCand.error) throw resCand.error;
        if (resCat.error) throw resCat.error;
        if (resVotes.error) throw resVotes.error;

        setCounts({
          results: (resAgg.data ?? []).length,
          candidates: (resCand.data ?? []).length,
          categories: (resCat.data ?? []).length,
          votes: (resVotes.data ?? []).length,
        });
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load export counts');
      } finally {
        setLoading(false);
      }
    })();
  }, [university_id, pw]);

  async function exportResults() {
    if (!university_id || !pw) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_admin_full_results_secure', { univ_id: university_id, plain_password: pw });
      if (error) throw error;
      const rows = (data ?? []) as Array<any>;
      const csv = toCSV(rows, [
        { key: 'gender', label: 'Category Gender' },
        { key: 'type', label: 'Category Type' },
        { key: 'waist_number', label: 'Waist Number' },
        { key: 'name', label: 'Candidate Name' },
        { key: 'candidate_id', label: 'Candidate ID' },
        { key: 'category_id', label: 'Category ID' },
        { key: 'votes', label: 'Votes' },
      ]);
      await Share.share({ message: csv, title: 'results.csv' });
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Unable to export results');
    } finally {
      setLoading(false);
    }
  }

  async function exportCandidates() {
    if (!university_id || !pw) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_candidates_secure', { univ_id: university_id, plain_password: pw });
      if (error) throw error;
      const rows = (data ?? []) as Array<any>;
      const csv = toCSV(rows, [
        { key: 'id', label: 'Candidate ID' },
        { key: 'gender', label: 'Gender' },
        { key: 'waist_number', label: 'Waist Number' },
        { key: 'name', label: 'Name' },
        { key: 'birthday', label: 'Birthday' },
        { key: 'height_cm', label: 'Height (cm)' },
        { key: 'hobby', label: 'Hobby' },
        { key: 'image_url', label: 'Image URL' },
        { key: 'is_active', label: 'Active' },
        { key: 'created_at', label: 'Created At' },
      ]);
      await Share.share({ message: csv, title: 'candidates.csv' });
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Unable to export candidates');
    } finally {
      setLoading(false);
    }
  }

  async function exportCategories() {
    if (!university_id || !pw) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_categories_secure', { univ_id: university_id, plain_password: pw });
      if (error) throw error;
      const rows = (data ?? []) as Array<any>;
      const csv = toCSV(rows, [
        { key: 'id', label: 'Category ID' },
        { key: 'gender', label: 'Gender' },
        { key: 'type', label: 'Type' },
        { key: 'is_active', label: 'Active' },
        { key: 'created_at', label: 'Created At' },
      ]);
      await Share.share({ message: csv, title: 'categories.csv' });
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Unable to export categories');
    } finally {
      setLoading(false);
    }
  }

  async function exportVotes() {
    if (!university_id || !pw) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_export_votes_secure', { univ_id: university_id, plain_password: pw });
      if (error) throw error;
      const rows = (data ?? []) as Array<any>;
      const csv = toCSV(rows, [
        { key: 'vote_id', label: 'Vote ID' },
        { key: 'device_id', label: 'Device ID' },
        { key: 'category_id', label: 'Category ID' },
        { key: 'category_gender', label: 'Category Gender' },
        { key: 'category_type', label: 'Category Type' },
        { key: 'candidate_id', label: 'Candidate ID' },
        { key: 'candidate_name', label: 'Candidate Name' },
        { key: 'candidate_gender', label: 'Candidate Gender' },
        { key: 'waist_number', label: 'Waist Number' },
      ]);
      await Share.share({ message: csv, title: 'votes.csv' });
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Unable to export votes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Export Data</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Share CSV files for analysis</Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: '#222', fontWeight: '600' }}>Back</Text>
          </Pressable>
        </View>

        {loading && (
          <View style={{ marginBottom: 12 }}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        {error && <Text style={{ color: '#ffdddd', marginBottom: 12 }}>{error}</Text>}

        {/* Export cards */}
        {[
          { title: 'Results (Aggregated)', count: counts.results, action: exportResults, icon: '📈', hint: 'category+candidate totals' },
          { title: 'Candidates', count: counts.candidates, action: exportCandidates, icon: '👤', hint: 'candidate master data' },
          { title: 'Categories', count: counts.categories, action: exportCategories, icon: '🏷️', hint: 'category list' },
          { title: 'Votes (Raw)', count: counts.votes, action: exportVotes, icon: '🗳️', hint: 'per vote details' },
        ].map(card => (
          <View
            key={card.title}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#e6e6e6',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#222' }}>{card.icon} {card.title}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{card.hint}</Text>
              </View>
              <Pressable onPress={card.action} style={{ backgroundColor: '#eef3ff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#c9d7ff' }}>
                <Text style={{ color: '#294aa6', fontWeight: '600' }}>Export CSV</Text>
              </Pressable>
            </View>
            <Text style={{ color: '#666', marginTop: 8 }}>Rows: {card.count}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}