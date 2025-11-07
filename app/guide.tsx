import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { FloatingActions } from '../components/floating-actions';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW


export default function UserGuide() {
  // Language toggle: ENG or MM
  const insets = useSafeAreaInsets(); // NEW: define safe-area insets
  const [lang, setLang] = useState<'ENG' | 'MM'>('MM');
  const [videoError, setVideoError] = useState(false);

  // English content (translated from your Burmese text)
  const engSections = [
    {
      title: 'Overview',
      points: [
        'Every user starts with 8 voting tickets.',
        'You can use 4 tickets in each selection: Male and Female.',
        'Each selection has 4 categories.',
        'Male: King, Style, Popular, Innocent.',
        'Female: Queen, Style, Popular, Innocent.',
        'Use one ticket per category (total 4 tickets per selection).',
      ],
    },
    {
      title: 'Rules',
      points: [
        'If you use a ticket for the King category (Male) on one candidate, you cannot use another ticket again in the same category for other male candidates.',
        'Distribute tickets one per category across the four categories.',
        'Do not use more than one ticket in the same category.',
      ],
    },
    {
      title: 'Example',
      points: [
        'You can use all 4 tickets on a single candidate within one selection.',
        'Example: For candidate “Mg Mg” (Male), use 4 tickets—one per category (King, Style, Popular, Innocent).',
      ],
    },
  ];

  // Burmese content (your original text, split into sections)
  const mmSections = [
    {
      title: 'အသုံးပြုနည်း လမ်းညွှန်',
      points: [
        'အသုံးပြုသူတိုင်းသည် Voting tickets ၈ ခု ရရှိမည်ဖြစ်သည်။',
        'Selection (ကျား၊ မ) တစ်ဦးချင်းစီအတွက် tickets ၄ ခုစီ အသုံးပြုနိုင်သည်။',
        'Selection (ကျား၊ မ) တစ်ခုချင်းစီတွင် အမျိုးအစား ၄ ခု ခွဲခြားထားသည်။',
        'Selection (ကျား) − King, Style, Popular, Innocent.',
        'Selection (မ) − Queen, Style, Popular, Innocent.',
        'ဖော်ပြပါ အမျိုးအစား ၄ ခုတွင် တစ်ခုချင်းစီအတွက် ticket ၁ ခုစီ အသုံးပြုနိုင်သည်။',
      ],
    },
    {
      title: 'သတိပြုရန်',
      points: [
        'King category (ကျား) အတွက် ticket ၁ ခု အသုံးပြုပါက အခြားသော (ကျား) candidate များအား King category အတွက် ticket ကို ထပ်မံအသုံးပြု၍မရနိုင်ပါ။',
        'Category ၄ ခုအတွက် ticket ၁ ခုစီသာ အညီအမျှ အသုံးပြုရမည်။',
        'Category တစ်ခုအတွက် ticket ၁ ထက်ပို၍ အသုံးပြု၍ မရနိုင်ပါ။',
        'သို့သော် Selection တစ်ဦးတည်းအတွက် ticket အားလုံး ( ၄ ခု ) အသုံးပြုချင်လျှင် အသုံးပြုနိုင်သည်။',
      ],
    },
    {
      title: 'ဥပမာ',
      points: [
        
        'ဥပမာ − Mg Mg (ကျား) တစ်ဦးတည်းအား Category ၄ ခုအတွက် ticket ၁ ခုစီ အသုံးပြု၍ စုစုပေါင်း ၄ ခုအထိ အသုံးပြုနိုင်သည်။',
        'သို့သော် Mg Mg အား King Category အတွက် ticket ၁ ခု အသုံးပြုပြီးပါက အခြားသော Candidate များအား (ဥပမာ − အောင်အောင်၊ ကျော်ကျော်) King Category အတွက် ticket အသုံးပြု၍မရနိုင်တော့ပါ။',
      ],
    },
  ];

  const sections = lang === 'ENG' ? engSections : mmSections;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#538df8ff',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: '#5B3DB5',
        }}
      />
      <LinearGradient
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, marginTop: 20 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', letterSpacing: 0.3 }}>
                User Guide
              </Text>
              <Text style={{ marginTop: 6, color: 'white', opacity: 0.9, textAlign: 'center' }}>
                {lang === 'ENG' ? 'Everything you need to use K-Q Voting' : 'K-Q Voting အတွက် လုပ်ဆောင်ရန် လမ်းညွှန်ချက်'}
              </Text>
            </View>

            {/* Language toggle */}
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: 22,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
                padding: 6,
                columnGap: 6,
                marginBottom: 14,
              }}
            >
              {/* MM first */}
              <Pressable
                onPress={() => setLang('MM')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: lang === 'MM' ? 'rgba(255,255,255,0.88)' : 'transparent',
                }}
              >
                <Text style={{ color: lang === 'MM' ? '#222' : 'white', fontWeight: '700' }}>MM</Text>
              </Pressable>
              <Pressable
                onPress={() => setLang('ENG')}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: lang === 'ENG' ? 'rgba(255,255,255,0.88)' : 'transparent',
                }}
              >
                <Text style={{ color: lang === 'ENG' ? '#222' : 'white', fontWeight: '700' }}>ENG</Text>
              </Pressable>
            </View>

            {/* YouTube Video Section */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 0,
                overflow: 'hidden',
                marginBottom: 14,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {!videoError ? (
                <YoutubePlayer
                  height={190}
                  play={false}
                  videoId="dp7FlCEvCXY"
                  initialPlayerParams={{
                    controls: true,
                    modestbranding: true,
                    rel: false,
                  }}
                  webViewProps={{
                    allowsInlineMediaPlayback: true,
                    mediaPlaybackRequiresUserAction: false,
                    allowsFullscreenVideo: true,
                  }}
                  onReady={() => setVideoError(false)}
                  onError={(e) => {
                    console.warn('YouTube inline playback error', e);
                    setVideoError(true);
                  }}
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <Text style={{ color: '#333', textAlign: 'center', marginBottom: 10 }}>
                    Unable to play inline. Open in YouTube.
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL('https://youtu.be/dp7FlCEvCXY')}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <Text style={{ color: '#222', fontWeight: '700' }}>Watch on YouTube</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Sections */}
            <View style={{ rowGap: 14 }}>
              {sections.map((s) => (
                <View
                  key={s.title}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    paddingVertical: 20,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    paddingBottom: 30,
                    borderColor: 'rgba(0,0,0,0.06)',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#222', textAlign: 'center' }}>{s.title}</Text>
                  <View style={{ marginTop: 8, rowGap: 6 }}>
                    {s.points.map((p, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Text style={{ color: '#6a5acd', fontSize: 16, marginRight: 8 }}>•</Text>
                        <Text style={{ color: '#333', fontSize: 15, flex: 1 }}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Footer actions */}
            {/* <View style={{ marginTop: 20, alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: 12,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  padding: 8,
                }}
              >
                <Pressable
                  onPress={() => router.push('/')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#222', fontWeight: '700' }}>Home</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/live-results')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    backgroundColor: 'transparent',
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Live Results</Text>
                </Pressable>
              </View>
            </View> */}
          </ScrollView>
          <FloatingActions style={{ position: 'absolute', right: 12, bottom: 24 }} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}