import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Candidate = {
  id: string;
  university_id: string;
  gender: string;
  waist_number: number | null;
  name: string;
  birthday: string | null;
  height_cm: number | null;
  hobby: string | null;
  image_url: string | null;
  is_active: boolean;
};

export default function AdminManageCandidates() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [genderFilter, setGenderFilter] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draft, setDraft] = useState<Partial<Candidate>>({});

  useEffect(() => {
    load();
  }, [university_id, pw]);

  async function load() {
    try {
      if (!university_id || !pw) {
        setError('Missing university ID or password');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('admin_list_candidates_secure', {
        univ_id: university_id,
        plain_password: pw,
      });
      if (error) throw error;
      setCandidates((data ?? []) as Candidate[]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return candidates.filter(c => c.gender?.toLowerCase() === genderFilter);
  }, [candidates, genderFilter]);

  function openNew() {
    setDraft({
      id: undefined,
      university_id: university_id!,
      gender: genderFilter,
      is_active: true,
      waist_number: null,
      name: '',
      birthday: null,
      height_cm: null,
      hobby: '',
      image_url: '',
    });
    setShowEditModal(true);
  }

  function openEdit(c: Candidate) {
    setDraft({ ...c });
    setShowEditModal(true);
  }

  async function saveDraft() {
    if (!university_id || !pw) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        univ_id: university_id,
        plain_password: pw,
        candidate_id: draft.id ?? null,
        gender_in: (draft.gender ?? 'male').toLowerCase(),
        waist_number_in: draft.waist_number ?? null,
        name_in: draft.name ?? '',
        birthday_in: draft.birthday ?? null,
        height_cm_in: draft.height_cm ?? null,
        hobby_in: draft.hobby ?? null,
        image_url_in: draft.image_url ?? null,
        is_active_in: draft.is_active ?? true,
      };
      const { data, error } = await supabase.rpc('admin_upsert_candidate_secure', payload as any);
      if (error) throw error;

      setShowEditModal(false);
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save candidate');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCandidate(id: string) {
    if (!university_id || !pw) return;
    Alert.alert('Delete Candidate', 'Are you sure you want to delete this candidate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.rpc('admin_delete_candidate_secure', {
              univ_id: university_id,
              plain_password: pw,
              candidate_id: id,
            });
            if (error) throw error;
            await load();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Failed to delete candidate');
          }
        },
      },
    ]);
  }

  function toggleActive(c: Candidate) {
    openEdit({ ...c, is_active: !c.is_active });
  }

  function GenderSwitch() {
    return (
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {(['male', 'female'] as const).map(g => (
          <Pressable
            key={g}
            onPress={() => setGenderFilter(g)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: genderFilter === g ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
            }}
          >
            <Text style={{ color: '#222', fontWeight: '600' }}>{g === 'male' ? 'Male' : 'Female'}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderRow({ item }: { item: Candidate }) {
    return (
      <View
        style={{
          padding: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.2)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: 'white', fontWeight: '700' }}>
            #{item.waist_number ?? '—'} {item.name}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => toggleActive(item)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ffd24f' }}
          >
            <Text>Toggle</Text>
          </Pressable>
          <Pressable
            onPress={() => openEdit(item)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#4f8cff' }}
          >
            <Text style={{ color: 'white' }}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => deleteCandidate(item.id)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#ff6b6b' }}
          >
            <Text style={{ color: 'white' }}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Manage Candidates</Text>
        <Text style={{ marginTop: 6, color: 'white', opacity: 0.9 }}>University</Text>

        <View style={{ marginTop: 16 }}>
          {loading && <ActivityIndicator color="#fff" />}
          {error && <Text style={{ marginTop: 8, color: '#ffdddd' }}>{error}</Text>}
          {!loading && (
            <>
              <GenderSwitch />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Pressable
                  onPress={openNew}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#4f8cff' }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Add Candidate</Text>
                </Pressable>
              </View>

              <FlatList
                data={filtered}
                renderItem={renderRow}
                keyExtractor={(c) => c.id}
              />
            </>
          )}
        </View>
      </View>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }} onPress={() => setShowEditModal(false)}>
          <Pressable style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, width: '100%', maxWidth: 420 }} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{draft.id ? 'Edit Candidate' : 'Add Candidate'}</Text>
            <View style={{ gap: 8 }}>
              <TextInput placeholder="Name" value={draft.name ?? ''} onChangeText={(v) => setDraft({ ...draft, name: v })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <TextInput placeholder="Waist Number" keyboardType="number-pad" value={draft.waist_number?.toString() ?? ''} onChangeText={(v) => setDraft({ ...draft, waist_number: v ? parseInt(v, 10) : null })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <TextInput placeholder="Birthday (YYYY-MM-DD)" value={draft.birthday ?? ''} onChangeText={(v) => setDraft({ ...draft, birthday: v })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <TextInput placeholder="Height (cm)" keyboardType="number-pad" value={draft.height_cm?.toString() ?? ''} onChangeText={(v) => setDraft({ ...draft, height_cm: v ? parseInt(v, 10) : null })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <TextInput placeholder="Hobby" value={draft.hobby ?? ''} onChangeText={(v) => setDraft({ ...draft, hobby: v })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <TextInput placeholder="Image URL" value={draft.image_url ?? ''} onChangeText={(v) => setDraft({ ...draft, image_url: v })} style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 }} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable onPress={() => setShowEditModal(false)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#eee', flex: 1 }}>
                  <Text style={{ textAlign: 'center' }}>Cancel</Text>
                </Pressable>
                <Pressable disabled={saving} onPress={saveDraft} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#4f8cff', flex: 1, opacity: saving ? 0.7 : 1 }}>
                  <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>{draft.id ? 'Save' : 'Create'}</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}