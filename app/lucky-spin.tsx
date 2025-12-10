import { FloatingActions } from '@/components/floating-actions';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import { Animated, Easing, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SEGMENTS = ['10K Ks', '500 Ks', '50K Ks', '50 Ks',  '5000 Ks', 'Try Again'];
const CREDITS_KEY = 'lucky_spin_credits_v2';
const FREE_CREDITS = 5;
const REWARD_BUNDLE = 3;
const rewardedUnitId = 'ca-app-pub-6368412009992703/1944080558';
const SPIN_COUNT_KEY = 'lucky_spin_count_v1';
const HISTORY_KEY = 'lucky_spin_history_v1';

export default function LuckySpin() {
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const burstAnim = React.useRef(new Animated.Value(0)).current;
  const ringAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const [targetDeg, setTargetDeg] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [credits, setCredits] = React.useState<number>(FREE_CREDITS);
  const [spinCount, setSpinCount] = React.useState<number>(0);
  const [history, setHistory] = React.useState<Array<{ n: number; label: string; ts: number }>>([]);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const rewarded = React.useRef(RewardedAd.createForAdRequest(rewardedUnitId, { requestNonPersonalizedAdsOnly: true })).current;
  const [rewardReady, setRewardReady] = React.useState(false);
  const [askingAd, setAskingAd] = React.useState(false);

  const prizeValue = (label: string) => {
    if (label === 'Try Again') return 0;
    const m = label.match(/^(\d+)(K)?\s*Ks$/i);
    if (!m) return 0;
    const num = Number(m[1]);
    const isK = !!m[2];
    return num * (isK ? 1000 : 1);
  };
  const totalPrize = React.useMemo(() => {
    return history.filter(h => h.label !== 'Try Again').reduce((sum, h) => sum + prizeValue(h.label), 0);
  }, [history]);

  const wheelRotation = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${targetDeg}deg`] });

  async function loadCredits() {
    try {
      const v = await SecureStore.getItemAsync(CREDITS_KEY);
      if (v == null) {
        await SecureStore.setItemAsync(CREDITS_KEY, String(FREE_CREDITS));
        setCredits(FREE_CREDITS);
      } else {
        setCredits(Number(v) || 0);
      }
    } catch {
      setCredits(FREE_CREDITS);
    }
  }

  async function saveCredits(next: number) {
    setCredits(next);
    try {
      await SecureStore.setItemAsync(CREDITS_KEY, String(next));
    } catch {}
  }

  async function loadSpinCount() {
    try {
      const v = await SecureStore.getItemAsync(SPIN_COUNT_KEY);
      setSpinCount(v ? Number(v) || 0 : 0);
    } catch {
      setSpinCount(0);
    }
  }

  async function saveSpinCount(next: number) {
    setSpinCount(next);
    try {
      await SecureStore.setItemAsync(SPIN_COUNT_KEY, String(next));
    } catch {}
  }

  async function loadHistory() {
    try {
      const v = await SecureStore.getItemAsync(HISTORY_KEY);
      if (v) {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) setHistory(arr);
      }
    } catch {}
  }

  async function saveHistory(next: Array<{ n: number; label: string; ts: number }>) {
    setHistory(next);
    try {
      await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  }

  useEffect(() => {
    loadCredits();
    loadSpinCount();
    loadHistory();
    const l = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => setRewardReady(true));
    const e = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      setAskingAd(false);
      setRewardReady(false);
      try {
        const v = await SecureStore.getItemAsync(CREDITS_KEY);
        const curr = v ? Number(v) || 0 : credits;
        await saveCredits(curr + REWARD_BUNDLE);
      } catch {
        await saveCredits(credits + REWARD_BUNDLE);
      }
      rewarded.load();
    });
    const c = rewarded.addAdEventListener(AdEventType.CLOSED, () => setAskingAd(false));
    const err = rewarded.addAdEventListener(AdEventType.ERROR, () => setAskingAd(false));
    rewarded.load();
    return () => {
      l();
      e();
      c();
      err();
    };
  }, []);

  const spin = async () => {
    if (spinning) return;
    if (credits <= 0) {
      setAskingAd(true);
      if (rewardReady) {
        rewarded.show().catch(() => setAskingAd(false));
      } else {
        rewarded.load();
      }
      return;
    }
    setResult(null);
    const n = SEGMENTS.length;
    const segmentAngle = 360 / n;
    const nextCount = spinCount + 1;
    const tryAgainIdx = SEGMENTS.indexOf('Try Again');
    const fiftyKsIdx = SEGMENTS.indexOf('50 Ks');
    const fiveHundredKsIdx = SEGMENTS.indexOf('500 Ks');
    const fiveThousandKsIdx = SEGMENTS.indexOf('5000 Ks');
    const is50KsSpin = nextCount === 2 || nextCount === 6 || nextCount === 11 || nextCount === 25 || nextCount === 50 || nextCount === 60 || nextCount === 100;
    const idx = nextCount === 1000 && fiveThousandKsIdx >= 0
      ? fiveThousandKsIdx
      : (nextCount === 500 || nextCount === 90) && fiveHundredKsIdx >= 0
      ? fiveHundredKsIdx
      : is50KsSpin && fiftyKsIdx >= 0
      ? fiftyKsIdx
      : (tryAgainIdx >= 0 ? tryAgainIdx : Math.floor(Math.random() * n));
    const centerAngle = idx * segmentAngle + segmentAngle / 2;
    const turns = 5;
    const finalDeg = turns * 360 + (360 - centerAngle);
    setTargetDeg(finalDeg);
    spinAnim.setValue(0);
    setSpinning(true);
    await saveCredits(credits - 1);
    await saveSpinCount(nextCount);
    Animated.timing(spinAnim, { toValue: 1, duration: 3000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setSpinning(false);
      setResult(SEGMENTS[idx]);
      if (SEGMENTS[idx] !== 'Try Again') {
        burstAnim.setValue(0);
        ringAnim.setValue(0);
        Animated.parallel([
          Animated.timing(burstAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start(() => {
          burstAnim.setValue(0);
          ringAnim.setValue(0);
        });
      }
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.03, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
      const entry = { n: nextCount, label: SEGMENTS[idx], ts: Date.now() };
      const nextHist = [entry, ...history];
      saveHistory(nextHist);
    });
  };

  const R = 160; // wheel radius in px
  const W = R * 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: '#538df8ff' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: '#5B3DB5' }} />
      <LinearGradient colors={["#538df8ff", "#5B3DB5", "#5B3DB5"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20}}>
          <View style={{ alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 24, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent' }}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: '#ffd34d', letterSpacing: 0.8, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>Lucky Spin</Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 1 }}>
            <View style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 24, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent',  }}>
              <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 0.6 }}>Chances left: {credits}</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 50, }}>
            <View style={{ width: 28, height: 15, alignItems: 'center' }}>
              <View style={{
                width: 0,
                height: 0,
                borderLeftWidth: 15,
                borderRightWidth: 15,
                borderTopWidth: 40,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: '#ffd34d',
                // shadowColor: '#000',
                // shadowOpacity: 0.5,
                // shadowRadius: 6,
                // shadowOffset: { width: 0, height: 10 },
              }} />
            </View>
            <Animated.View style={{ width: W, height: W, borderRadius: R, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.85)', transform: [{ rotate: wheelRotation }, { scale: scaleAnim }], overflow: 'hidden', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}>
              {/* Radial separators removed for cleaner look */}

              {/* Inner donut for depth */}
              <View style={{ position: 'absolute', width: W * 0.62, height: W * 0.62, borderRadius: (W * 0.62) / 2, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }} />
              {/* Center hub */}
              <View style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.8)' }} />

              {/* Labels on circumference, upright */}
              {SEGMENTS.map((label, i) => {
                const angle = (360 / SEGMENTS.length) * i + (360 / SEGMENTS.length) / 2;
                const isBig = label === '50K Ks' || label === '5000 Ks' || label === '10K Ks';
                const display = (() => {
                  if (isBig) return `★ ${label} ★`;
                  if (label.startsWith('Kpay')) return '' + label;
                  if (label.startsWith('50 Ks')) return '' + label;
                  if (label === 'Try Again') return '' + label;
                  return label;
                })();
                return (
                  <View key={`lab-${label}`} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ transform: [{ rotate: `${angle}deg` }, { translateY: -R + (isBig ? 36 : 32) }] }}>
                      <Text style={{ color: isBig ? '#ffd34d' : 'white', fontWeight: isBig ? '900' : '700', fontSize: isBig ? 16 : 13, letterSpacing: isBig ? 0.8 : 0.5, textAlign: 'center', textShadowColor: isBig ? 'rgba(0,0,0,0.35)' : undefined, textShadowOffset: isBig ? { width: 0, height: 1 } : undefined, textShadowRadius: isBig ? 2 : undefined }}>{display}</Text>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              {Array.from({ length: 20 }).map((_, i) => {
                const count = 20;
                const theta = (2 * Math.PI * i) / count;
                const radius = 80 + (i % 5) * 6;
                const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(theta) * radius] });
                const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(theta) * radius] });
                const s = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] });
                const o = burstAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1, 0] });
                const color = i % 3 === 0 ? '#ffd34d' : i % 3 === 1 ? '#fff08a' : '#ffe17a';
                return (
                  <Animated.Text
                    key={`burst-${i}`}
                    style={{ position: 'absolute', transform: [{ translateX: tx }, { translateY: ty }, { scale: s }], opacity: o, color, fontSize: 18, fontWeight: '900' }}
                  >
                    ★
                  </Animated.Text>
                );
              })}
              {(() => {
                const ringScale1 = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.15] });
                const ringOpacity1 = ringAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0.9, 0] });
                const ringScale2 = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.35] });
                const ringOpacity2 = ringAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.7, 0] });
                return (
                  <>
                    <Animated.View style={{ position: 'absolute', width: W * 0.9, height: W * 0.9, borderRadius: (W * 0.9) / 2, borderWidth: 2, borderColor: '#ffd34d', opacity: ringOpacity1, transform: [{ scale: ringScale1 }] }} />
                    <Animated.View style={{ position: 'absolute', width: W * 0.7, height: W * 0.7, borderRadius: (W * 0.7) / 2, borderWidth: 2, borderColor: '#fff08a', opacity: ringOpacity2, transform: [{ scale: ringScale2 }] }} />
                  </>
                );
              })()}
            </View>
          </View>

          {result && (
            <View style={{ alignItems: 'center', marginTop: -30, marginBottom: 20 }}>
              <View style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 24, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
                <Text style={{ color: '#ffd34d', fontWeight: '900', fontSize: 30, letterSpacing: 0.8 }}>{result}</Text>
              </View>
            </View>
          )}

          {/* History trigger button (bottom-right, left of gear) */}
          <Pressable
            onPress={() => setHistoryOpen(true)}
            style={{ position: 'absolute', right: 15, bottom: insets.bottom + 90, width: 44, height: 44, borderRadius: 14, backgroundColor: '#D7F3E3', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
          >
            <IconSymbol name="clock.fill" color="#0A7E4A" size={18} />
          </Pressable>

          <View style={{ alignItems: 'center', marginTop: 0 }}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable onPress={() => {
                Animated.sequence([
                  Animated.spring(buttonScale, { toValue: 1.06, friction: 6, tension: 120, useNativeDriver: true }),
                  Animated.spring(buttonScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
                ]).start();
                spin();
              }} disabled={spinning} style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: spinning ? '#ffd34d61' : '#ffd34d94', minWidth: 100, alignItems: 'center',shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
                <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 0.8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>{spinning ? 'Spinning…' : credits > 0 ? 'Spin' : 'Watch ads(+3 to Spin)'}</Text>
              </Pressable>
            </Animated.View>
            {credits <= 0 && (
              <Text style={{ marginTop: 10, color: '#ffd34d', fontWeight: '800', letterSpacing: 0.4 }}>❗️Use VPN to appear ads.❗️</Text>
            )}
            {/* <Pressable onPress={() => router.back()} style={{ marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22, backgroundColor: '#6b4de6' }}>
              <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 0.6 }}>Back</Text>
            </Pressable> */}
          </View>
        </View>
        <FloatingActions  
        style={{
            right: 12,
            bottom: 84,
            top: undefined,
            transform: [{ translateY: -100 }],
            zIndex: 0,
          }}
        />
      </LinearGradient>
      {/* History modal */}
      <Modal visible={historyOpen} animationType="fade" transparent onRequestClose={() => setHistoryOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setHistoryOpen(false)}>
          <View style={{ backgroundColor: '#fff', width: '90%', maxWidth: 460, borderRadius: 20, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Spin History</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, marginBottom: 6 }}>
              <Text style={{ color: '#333', fontWeight: '700' }}>Total</Text>
              <Text style={{ color: '#B8860B', fontWeight: '800' }}>{totalPrize.toLocaleString()} Ks</Text>
            </View>
            {history.filter(h => h.label !== 'Try Again').length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666' }}>No prize history yet</Text>
            ) : (
              <View style={{ maxHeight: 360 }}>
                <ScrollView>
                  {history.filter(h => h.label !== 'Try Again').map(h => (
                    <View key={`${h.n}-${h.ts}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                      <Text style={{ color: '#333' }}>Prize</Text>
                      <Text style={{ color: '#B8860B', fontWeight: '800' }}>{h.label}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <Pressable onPress={() => setHistoryOpen(false)} style={{ marginTop: 12, backgroundColor: '#D7F3E3', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#0A7E4A', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
