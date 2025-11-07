import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type University = {
  id: string;
  name: string;
};

type AdminStats = {
  totalVotes: number;
  totalCandidates: number;
  totalCategories: number;
  votingStatus: 'active' | 'inactive' | 'scheduled';
};

export default function AdminDashboard() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!university_id || !pw) {
      setError('Missing authentication parameters');
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [university_id, pw]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch university info
      const { data: univData, error: univError } = await supabase
        .from('universities')
        .select('id, name')
        .eq('id', university_id)
        .single();

      if (univError) throw univError;
      setUniversity(univData);

      // Fetch admin stats using the secure RPC
      const { data: resultsData, error: resultsError } = await supabase.rpc('get_admin_full_results_secure', {
        univ_id: university_id,
        plain_password: pw,
      });

      if (resultsError) throw resultsError;

      // Calculate stats
      const totalVotes = resultsData?.reduce((sum: number, row: any) => sum + row.votes, 0) || 0;
      const totalCandidates = new Set(resultsData?.map((row: any) => row.candidate_id)).size || 0;
      const totalCategories = new Set(resultsData?.map((row: any) => row.category_id)).size || 0;

      setStats({
        totalVotes,
        totalCandidates,
        totalCategories,
        votingStatus: 'active', // You can enhance this based on your voting window logic
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setLoading(false);
    }
  }

  function navigateToResults() {
    router.push({
      pathname: '/admin/results',
      params: { university_id, pw },
    });
  }

  function navigateToManagement() {
    router.push({
      pathname: '/admin/candidates',
      params: { university_id, pw },
    });
  }

  function navigateToCategories() {
    router.push({
      pathname: '/admin/categories',
      params: { university_id, pw },
    });
  }

  function navigateToExport() {
    router.push({
      pathname: '/admin/export',
      params: { university_id, pw },
    });
  }

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/admin/login') },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: 'white', marginTop: 16 }}>Loading dashboard...</Text>
          </View>
       
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <LinearGradient
          colors={['#538df8ff', '#5B3DB5', '#5B3DB5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ffdddd', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
          <Pressable
            onPress={() => router.replace('/admin/login')}
            style={{
              backgroundColor: '#4f8cff',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Back to Login</Text>
          </Pressable>
        </View>
        </LinearGradient>
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
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>
                Admin Dashboard
              </Text>
              <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 }}>
                {university?.name}
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 }}>
            Overview
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <StatCard
              title="Total Votes"
              value={stats?.totalVotes.toLocaleString() || '0'}
              icon="📊"
              color="#4f8cff"
            />
            <StatCard
              title="Candidates"
              value={stats?.totalCandidates.toString() || '0'}
              icon="👥"
              color="#ff6b6b"
            />
            <StatCard
              title="Categories"
              value={stats?.totalCategories.toString() || '0'}
              icon="🏆"
              color="#51cf66"
            />
            <StatCard
              title="Status"
              value={stats?.votingStatus === 'active' ? 'Active' : 'Inactive'}
              icon={stats?.votingStatus === 'active' ? '🟢' : '🔴'}
              color="#ffd43b"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 }}>
            Actions
          </Text>
          
          <View style={{ gap: 12 }}>
            <ActionButton
              title="View Results"
              description="View detailed voting results and rankings"
              icon="📈"
              onPress={navigateToResults}
            />
            {/* <ActionButton
              title="Manage Candidates"
              description="Add, edit, or remove candidates"
              icon="👤"
              onPress={navigateToManagement}
              // remove disabled to enable navigation
            /> */}
            {/* <ActionButton
              title="Manage Categories"
              description="Configure voting categories"
              icon="🏷️"
              onPress={navigateToCategories}
            />
            <ActionButton
              title="Export Data"
              description="Export voting data and results"
              icon="📤"
              onPress={navigateToExport}
            /> */}
          </View>
        </View>
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      flex: 1,
      minWidth: 140,
      borderLeftWidth: 4,
      borderLeftColor: color,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>{icon}</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
          {title}
        </Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({ 
  title, 
  description, 
  icon, 
  onPress, 
  disabled = false 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        backgroundColor: disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 24, marginRight: 16 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>
          {description}
        </Text>
      </View>
      {!disabled && (
        <Text style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)' }}>→</Text>
      )}
      {disabled && (
        <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
          Coming Soon
        </Text>
      )}
    </Pressable>
  );
}