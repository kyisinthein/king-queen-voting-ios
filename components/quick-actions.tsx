import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

type Action = { label: string; icon: string; href: string };

const ACTIONS: Action[] = [
  { label: 'Home',       icon: 'house.fill',        href: '/home' },
  { label: 'List',       icon: 'list.bullet',       href: '/university/[id]' },
  { label: 'Live Results', icon: 'chart.bar.fill',  href: '/results' },
  { label: 'My Votes',   icon: 'checkmark.circle.fill', href: '/my-votes' },
    { label: 'About us',   icon: 'info.circle.fill',  href: '/about' },
    { label: 'User Guide', icon: 'book.fill',         href: '/guide' },
  { label: 'Sponsors',   icon: 'star.fill',         href: '/sponsors' },
  { label: 'ကံစမ်းရန်',        icon: 'gift.fill',         href: '#' },
];

export function QuickActions({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const interstitialUnitId = 'ca-app-pub-6368412009992703/4737038504';
  const rewardedUnitId = 'ca-app-pub-6368412009992703/1944080558';
  const interstitial = useMemo(
    () => InterstitialAd.createForAdRequest(interstitialUnitId, { requestNonPersonalizedAdsOnly: true }),
    []
  );
  const rewarded = useMemo(
    () => RewardedAd.createForAdRequest(rewardedUnitId, { requestNonPersonalizedAdsOnly: true }),
    []
  );
  const [adLoaded, setAdLoaded] = useState(false);
  const pendingMyVotesNavRef = useRef(false);
  const [rewardLoaded, setRewardLoaded] = useState(false);
  const pendingRewardShowRef = useRef(false);

  useEffect(() => {
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
      if (pendingMyVotesNavRef.current) {
        interstitial.show().catch(() => {
          pendingMyVotesNavRef.current = false;
          router.push('/about');
        });
      }
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      if (pendingMyVotesNavRef.current) {
        pendingMyVotesNavRef.current = false;
        router.push('/about');
      }
    });
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      if (pendingMyVotesNavRef.current) {
        pendingMyVotesNavRef.current = false;
        router.push('/about');
      }
    });

    const rLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setRewardLoaded(true);
      if (pendingRewardShowRef.current) {
        rewarded.show().catch(() => {
          pendingRewardShowRef.current = false;
        });
      }
    });
    const rEarn = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      pendingRewardShowRef.current = false;
    });
    const rClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardLoaded(false);
      pendingRewardShowRef.current = false;
    });
    const rError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      pendingRewardShowRef.current = false;
    });

    if (visible) {
      setAdLoaded(false);
      interstitial.load();
      setRewardLoaded(false);
      rewarded.load();
    }

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      rLoaded();
      rEarn();
      rClosed();
      rError();
    };
  }, [interstitial, rewarded, visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: '#fff',
            width: '90%',
            maxWidth: 460,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Pressable
            onPress={() => {
              onClose();
              router.push('/admin/login');
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 22, marginTop: 8 }}>
              Quick Actions
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.label}
                onPress={() => {
                  onClose();
                  if (a.label === 'About us') {
                    pendingMyVotesNavRef.current = true;
                    if (adLoaded) {
                      interstitial.show().catch(() => {
                        pendingMyVotesNavRef.current = false;
                        router.push('/about');
                      });
                    } else {
                      interstitial.load();
                    }
                  } else if (a.label === 'List') {
                    router.push({ pathname: '/university/[id]', params: { id: 'a12e27fd-8a93-4234-9b76-b1c63f2be766' } } as any);
                  } else if (a.label === 'ကံစမ်းရန်') {
                    router.push('/lucky-spin');
                  } else {
                    router.push(a.href as any);
                  }
                }}
                style={{
                  width: '48%',
                  marginBottom: 12,
                  backgroundColor: '#f6f8faab',
                  borderRadius: 15,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'transparent',
                }}>
                <IconSymbol
                  name={a.icon as any}
                  color={a.label === 'Sponsors' ? '#FF0000' : a.label === 'ကံစမ်းရန်' ? '#0A7E4A' : '#333'}
                  size={22}
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontWeight: '600',
                    color: a.label === 'Sponsors' ? '#FF0000' : a.label === 'ကံစမ်းရန်' ? '#0A7E4A' : '#333',
                  }}
                >
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            style={{
              marginTop: 8,
              backgroundColor: '#D7F3E3',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0A7E4A', fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
