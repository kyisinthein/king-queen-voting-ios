import { QuickActions } from '@/components/quick-actions';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POS_KEY = 'floating_actions_top_v1';

export function FloatingActions({ style }: { style?: ViewStyle }) {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const insets = useSafeAreaInsets();
  const topY = useRef(new Animated.Value(Dimensions.get('window').height / 2)).current;
  const startTopRef = useRef<number>(Dimensions.get('window').height / 2);
  const MESSAGES_LAST_SEEN_KEY = 'messages_last_seen_ts_v1';

  useEffect(() => {
    (async () => {
      try {
        const v = await SecureStore.getItemAsync(POS_KEY);
        const h = Dimensions.get('window').height;
        const minTop = insets.top + 40;
        const maxTop = h - insets.bottom - 100;
        const initial = v ? Number(v) || (h / 2) : h / 2;
        const clamped = Math.max(minTop, Math.min(maxTop, initial));
        topY.setValue(clamped);
        startTopRef.current = clamped;
      } catch {
        const h = Dimensions.get('window').height;
        const mid = h / 2;
        topY.setValue(mid);
        startTopRef.current = mid;
      }
    })();
  }, [insets, topY]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
        const latestIso = (data ?? [])[0]?.created_at as string | undefined;
        if (!latestIso) {
          setHasUnread(false);
          setUnreadCount(0);
          return;
        }
        const latestTs = new Date(latestIso).getTime();
        const stored = await SecureStore.getItemAsync(MESSAGES_LAST_SEEN_KEY);
        const seenTs = stored ? Number(stored) || 0 : 0;
        const has = latestTs > seenTs;
        setHasUnread(has);
        const seenIso = new Date(seenTs || 0).toISOString();
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .gt('created_at', seenIso);
        setUnreadCount(count ?? 0);
      } catch {
        setHasUnread(false);
        setUnreadCount(0);
      }
    })();
  }, [open]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        startTopRef.current = (topY as any)._value;
      },
      onPanResponderMove: (_evt, gesture) => {
        const h = Dimensions.get('window').height;
        const minTop = insets.top + 40;
        const maxTop = h - insets.bottom - 100;
        const next = Math.max(minTop, Math.min(maxTop, startTopRef.current + gesture.dy));
        topY.setValue(next);
      },
      onPanResponderRelease: async () => {
        try {
          const val = (topY as any)._value;
          await SecureStore.setItemAsync(POS_KEY, String(Math.round(val)));
        } catch {}
      },
    })
  ).current;

  return (
    <>
      <Animated.View {...pan.panHandlers} style={[style, { position: 'absolute', right: 16, top: topY, zIndex: 100 }]}>
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: '#A7D8D8',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <IconSymbol name="gearshape.fill" color="#3E5C5C" size={20} />
          {hasUnread && (
            <View
              style={{
                position: 'absolute',
                top: -10,
                right: 0,
                minWidth: 25,
                height: 25,
                paddingHorizontal: 4,
                borderRadius: 9,
                backgroundColor: '#FF3B30',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>
                {unreadCount > 99 ? '99+' : String(unreadCount)}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      <QuickActions visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
