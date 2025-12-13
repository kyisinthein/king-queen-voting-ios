import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingActions } from '../components/floating-actions';
import { supabase } from '../lib/supabase';

type Message = {
  id: string;
  title: string;
  body: string;
  image_url?: string | null;
  link_url?: string | null;
  is_active: boolean;
  created_at: string;
};

export default function Messages() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const MESSAGES_LAST_SEEN_KEY = 'messages_last_seen_ts_v1';

  const formatRelative = (iso: string) => {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = Math.max(0, now - then);
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay === 1) return 'yesterday';
    return `${diffDay} days ago`;
  };

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('messages')
          .select('id,title,body,image_url,link_url,is_active,created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        const arr = data ?? [];
        setMessages(arr);
        const latestIso = arr[0]?.created_at as string | undefined;
        if (latestIso) {
          const ts = new Date(latestIso).getTime();
          await SecureStore.setItemAsync(MESSAGES_LAST_SEEN_KEY, String(ts));
        }
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase().includes('network request failed')
          ? 'No internet connection. Please check and try again.'
          : 'Unable to load messages. Please try again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: '#538df8ff' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: '#5B3DB5' }} />
      <LinearGradient colors={['#538df8ff', '#5B3DB5', '#5B3DB5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#ffd34d', letterSpacing: 0.8, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>Messages</Text>
          </View>

          {loading && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}

          {!loading && error && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: '#ffdddd' }}>{error}</Text>
            </View>
          )}

          {!loading && !error && messages.length === 0 && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: 'white', opacity: 0.9 }}>No messages yet.</Text>
            </View>
          )}

          {!loading && !error && messages.length > 0 && (
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100, marginTop: 20 }}>
              {messages.map((m) => {
                const stamp = formatRelative(m.created_at);
                const onOpenLink = async () => {
                  if (m.link_url) {
                    try {
                      await Linking.openURL(m.link_url);
                    } catch {}
                  }
                };
                return (
                  <View
                    key={m.id}
                    style={{
                      marginBottom: 12,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.35)',
                      padding: 14,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 0.4, fontSize: 16 }}>{m.title}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{stamp}</Text>
                    </View>
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: 'white', opacity: 0.95, lineHeight: 20, paddingTop: 10 }}>{m.body}</Text>
                    </View>
                    {m.link_url && (
                      <View style={{ marginTop: 10 }}>
                        <Pressable
                          onPress={onOpenLink}
                          style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#D7F3E3' }}
                        >
                          <Text style={{ color: '#0A7E4A', fontWeight: '700' }}>Open Link</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <FloatingActions />
      </LinearGradient>
    </SafeAreaView>
  );
}
