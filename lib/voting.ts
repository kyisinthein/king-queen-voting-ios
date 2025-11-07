import { supabase } from './supabase';

export type UUID = string;
export type Gender = 'male' | 'female';
export type CategoryType = 'king' | 'style' | 'popular' | 'innocent';

export async function fetchActiveUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('id,name,slug,is_active,voting_start_at,voting_end_at')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveCategories(universityId: UUID) {
  const { data, error } = await supabase
    .from('categories')
    .select('id,university_id,gender,type,is_active,created_at')
    .eq('university_id', universityId)
    .eq('is_active', true)
    .order('gender', { ascending: true })
    .order('type', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveCandidates(universityId: UUID, gender: Gender) {
  const { data, error } = await supabase
    .from('candidates')
    .select('id,university_id,gender,waist_number,name,birthday,height_cm,hobby,image_url,is_active,created_at')
    .eq('university_id', universityId)
    .ilike('gender', gender)
    .eq('is_active', true)
    .order('waist_number', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDeviceTicketUsage(universityId: UUID, deviceId: string) {
  const { data, error } = await supabase.rpc('get_device_ticket_usage', {
    univ_id: universityId,
    p_device_id: deviceId,
  });
  if (error) throw error;
  return data ?? [];
}

export async function castVote(params: {
  universityId: UUID;
  categoryId: UUID;
  candidateId: UUID;
  deviceId: string;
}) {
  const { error } = await supabase
    .from('votes')
    .insert(
      {
        university_id: params.universityId,
        category_id: params.categoryId,
        candidate_id: params.candidateId,
        device_id: params.deviceId,
      },
      { returning: 'minimal' }
    );

  if (error) {
    if ((error as any).code === '23505') {
      throw new Error('You already voted in this category.');
    }
    throw error;
  }
  return true;
}

export async function fetchPublicTopResults(categoryIds: UUID[]) {
  const { data, error } = await supabase
    .from('public_top_results')
    .select('category_id,candidate_id,votes')
    .in('category_id', categoryIds);
  if (error) throw error;
  return data ?? [];
}

/* Admin RPCs */
export async function adminVerifyPassword(universityId: UUID, password: string) {
  const { data, error } = await supabase.rpc('admin_verify_password', {
    univ_id: universityId,
    plain_password: password,
  });
  if (error) throw error;
  return !!data;
}

export async function adminListCategories(universityId: UUID, password: string) {
  const { data, error } = await supabase.rpc('admin_list_categories_secure', {
    univ_id: universityId,
    plain_password: password,
  });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertCategory(params: {
  universityId: UUID;
  password: string;
  categoryId?: UUID | null;
  gender: Gender;
  type: CategoryType;
  isActive: boolean;
}) {
  const { data, error } = await supabase.rpc('admin_upsert_category_secure', {
    univ_id: params.universityId,
    plain_password: params.password,
    category_id: params.categoryId ?? null,
    gender_in: params.gender,
    type_in: params.type,
    is_active_in: params.isActive,
  });
  if (error) throw error;
  return data as UUID;
}

export async function adminDeleteCategory(universityId: UUID, password: string, categoryId: UUID) {
  const { data, error } = await supabase.rpc('admin_delete_category_secure', {
    univ_id: universityId,
    plain_password: password,
    category_id: categoryId,
  });
  if (error) throw error;
  return !!data;
}

export async function adminListCandidates(universityId: UUID, password: string) {
  const { data, error } = await supabase.rpc('admin_list_candidates_secure', {
    univ_id: universityId,
    plain_password: password,
  });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertCandidate(params: {
  universityId: UUID;
  password: string;
  candidateId?: UUID | null;
  gender: Gender;
  waistNumber: number;
  name: string;
  birthday?: string | null;
  heightCm?: number | null;
  hobby?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}) {
  const { data, error } = await supabase.rpc('admin_upsert_candidate_secure', {
    univ_id: params.universityId,
    plain_password: params.password,
    candidate_id: params.candidateId ?? null,
    gender_in: params.gender,
    waist_number_in: params.waistNumber,
    name_in: params.name,
    birthday_in: params.birthday ?? null,
    height_cm_in: params.heightCm ?? null,
    hobby_in: params.hobby ?? null,
    image_url_in: params.imageUrl ?? null,
    is_active_in: params.isActive,
  });
  if (error) throw error;
  return data as UUID;
}

export async function adminDeleteCandidate(universityId: UUID, password: string, candidateId: UUID) {
  const { data, error } = await supabase.rpc('admin_delete_candidate_secure', {
    univ_id: universityId,
    plain_password: password,
    candidate_id: candidateId,
  });
  if (error) throw error;
  return !!data;
}

export async function adminGetFullResults(universityId: UUID, password: string) {
  const { data, error } = await supabase.rpc('get_admin_full_results_secure', {
    univ_id: universityId,
    plain_password: password,
  });
  if (error) throw error;
  return data ?? [];
}

export async function adminExportVotes(universityId: UUID, password: string) {
  const { data, error } = await supabase.rpc('admin_export_votes_secure', {
    univ_id: universityId,
    plain_password: password,
  });
  if (error) throw error;
  return data ?? [];
}