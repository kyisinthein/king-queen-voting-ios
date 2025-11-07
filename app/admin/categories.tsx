import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, ScrollView, Text, TextInput, View, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type CategoryRow = {
  id: string;
  university_id: string;
  gender: string;
  type: string;
  is_active: boolean;
  created_at?: string;
};

function getDisplayType(gender: string, type: string): string {
  const g = gender?.toLowerCase();
  const t = type?.toLowerCase();
  if (t === 'king') return g === 'female' ? 'Queen' : 'King';
  if (t === 'style') return 'Style';
  if (t === 'popular') return 'Popular';
  if (t === 'innocent') return 'Innocent';
  return type;
}

export default function AdminCategories() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<{ gender: 'male' | 'female'; type: 'king' | 'style' | 'popular' | 'innocent'; is_active: boolean }>({
    gender: 'male',
    type: 'king',
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
  }, [university_id, pw]);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);

      if (!university_id || !pw) {
        setError('Missing authentication parameters');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('admin_list_categories_secure', {
        univ_id: university_id,
        plain_password: pw,
      });
      if (error) throw error;
      setCategories((data ?? []) as CategoryRow[]);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ gender: 'male', type: 'king', is_active: true });
    setShowForm(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setForm({
      gender: (cat.gender?.toLowerCase() === 'female' ? 'female' : 'male'),
      type: (['king','style','popular','innocent'].includes(cat.type?.toLowerCase()) ? cat.type.toLowerCase() as any : 'king'),
      is_active: !!cat.is_active,
    });
    setShowForm(true);
  }

  async function saveForm() {
    try {
      if (!university_id || !pw) throw new Error('Missing authentication parameters');
      const { gender, type, is_active } = form;
      const { data, error } = await supabase.rpc('admin_upsert_category_secure', {
        univ_id: university_id,
        plain_password: pw,
        category_id: editing?.id ?? null,
        gender_in: gender,
        type_in: type,
        is_active_in: is_active,
      });
      if (error) throw error;
      setShowForm(false);
      await loadCategories();
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message ?? 'Unable to save category');
    }
  }

  async function toggleActive(cat: CategoryRow) {
    try {
      const { error } = await supabase.rpc('admin_upsert_category_secure', {
        univ_id: university_id,
        plain_password: pw,
        category_id: cat.id,
        gender_in: cat.gender,
        type_in: cat.type,
        is_active_in: !cat.is_active,
      });
      if (error) throw error;
      await loadCategories();
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message ?? 'Unable to update category');
    }
  }

  async function deleteCategory(cat: CategoryRow) {
    Alert.alert(
      'Delete Category',
      `Delete ${getDisplayType(cat.gender, cat.type)} category?\nNote: deletion may fail if referenced by votes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.rpc('admin_delete_category_secure', {
                univ_id: university_id,
                plain_password: pw,
                category_id: cat.id,
              });
              if (error) throw error;
              await loadCategories();
            } catch (e: any) {
              Alert.alert('Delete Failed', e?.message ?? 'Unable to delete category');
            }
          },
        },
      ]
    );
  }

  const ordered = useMemo(() => {
    const order: Array<{ gender: 'male' | 'female'; type: string }> = [
      { gender: 'male', type: 'king' },
      { gender: 'female', type: 'king' },
      { gender: 'male', type: 'style' },
      { gender: 'female', type: 'style' },
      { gender: 'male', type: 'popular' },
      { gender: 'female', type: 'popular' },
      { gender: 'male', type: 'innocent' },
      { gender: 'female', type: 'innocent' },
    ];
    const byKey = new Map(categories.map(c => [`${c.gender}:${c.type}`, c] as const));
    return order.map(o => byKey.get(`${o.gender}:${o.type}`)).filter(Boolean) as CategoryRow[];
  }, [categories]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 16 }}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ffdddd', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <Pressable onPress={() => router.back()} style={{ padding: 12, backgroundColor: 'white', borderRadius: 8 }}>
            <Text style={{ color: '#222', fontWeight: '600' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Manage Categories</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              Configure voting categories for this university
            </Text>
          </View>
          <Pressable onPress={openCreate} style={{ backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: '#222', fontWeight: '600' }}>Add Category</Text>
          </Pressable>
        </View>

        {/* List */}
        <FlatList
          data={ordered.length > 0 ? ordered : categories}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 12 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#e6e6e6',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#222' }}>
                  {getDisplayType(item.gender, item.type)}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {item.gender?.toLowerCase() === 'female' ? 'Female' : 'Male'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => toggleActive(item)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: item.is_active ? '#e7f9ec' : '#fdeeee',
                    borderWidth: 1,
                    borderColor: item.is_active ? '#b8e6c5' : '#f6c0c0',
                  }}
                >
                  <Text style={{ color: item.is_active ? '#126b3f' : '#7c1d1d', fontWeight: '600' }}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => openEdit(item)}
                  style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#eef3ff', borderWidth: 1, borderColor: '#c9d7ff' }}
                >
                  <Text style={{ color: '#294aa6', fontWeight: '600' }}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => deleteCategory(item)}
                  style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#ffecec', borderWidth: 1, borderColor: '#ffcccc' }}
                >
                  <Text style={{ color: '#b00020', fontWeight: '600' }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />

        {/* Form Modal (inline) */}
        {showForm && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: '#e6e6e6',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#222' }}>
              {editing ? 'Edit Category' : 'Add Category'}
            </Text>

            {/* Gender selector */}
            <Text style={{ marginTop: 12, color: '#666' }}>Gender</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {(['male','female'] as const).map(g => (
                <Pressable
                  key={g}
                  onPress={() => setForm({ ...form, gender: g })}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: form.gender === g ? '#eef3ff' : 'transparent',
                    borderWidth: 1,
                    borderColor: '#c9d7ff',
                  }}
                >
                  <Text style={{ color: '#294aa6', fontWeight: '600' }}>{g === 'female' ? 'Female' : 'Male'}</Text>
                </Pressable>
              ))}
            </View>

            {/* Type selector */}
            <Text style={{ marginTop: 12, color: '#666' }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {(['king','style','popular','innocent'] as const).map(t => (
                <Pressable
                  key={t}
                  onPress={() => setForm({ ...form, type: t })}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: form.type === t ? '#eef3ff' : 'transparent',
                    borderWidth: 1,
                    borderColor: '#c9d7ff',
                  }}
                >
                  <Text style={{ color: '#294aa6', fontWeight: '600' }}>{getDisplayType(form.gender, t)}</Text>
                </Pressable>
              ))}
            </View>

            {/* Active toggle */}
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={() => setForm({ ...form, is_active: !form.is_active })}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: form.is_active ? '#e7f9ec' : '#fdeeee',
                  borderWidth: 1,
                  borderColor: form.is_active ? '#b8e6c5' : '#f6c0c0',
                }}
              >
                <Text style={{ color: form.is_active ? '#126b3f' : '#7c1d1d', fontWeight: '600' }}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </Text>
              </Pressable>
              <Text style={{ color: '#666' }}>Category status</Text>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable onPress={saveForm} style={{ backgroundColor: '#294aa6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>{editing ? 'Save Changes' : 'Create Category'}</Text>
              </Pressable>
              <Pressable onPress={() => setShowForm(false)} style={{ backgroundColor: '#eee', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
                <Text style={{ color: '#222', fontWeight: '600' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}