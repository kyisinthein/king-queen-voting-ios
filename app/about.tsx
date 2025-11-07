import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { FloatingActions } from '../components/floating-actions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function About() {
  const cards = [
    {
      title: '',
      body:
        '',
      icon: '',
    },
    // {
    //   title: 'What We Do',
    //   body:
    //     'We provide candidate profiles, live results, and admin tools to manage categories and export data safely.',
    //   icon: '',
    // },
    // {
    //   title: 'Values',
    //   body:
    //     'Privacy-first, inclusive design, and reliable performance across devices. We continuously polish the experience.',
    //   icon: '',
    // },
  ];

  function contactEmail() {
    Linking.openURL('mailto:kyisinthein6940@gmail.com?subject=Work%20Inquiry');
  }
  function contactPhone() {
    Linking.openURL('tel:+959694033156');
  }
  function contactDiscord() {
    Linking.openURL('https://discordapp.com/users/1377886550133833770');
  }

  const insets = useSafeAreaInsets(); // NEW: define safe-area insets

  const [copiedKey, setCopiedKey] = useState<null | 'phone' | 'email' | 'discord'>(null);

  async function copyToClipboard(text: string, key: 'phone' | 'email' | 'discord') {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <>
      {/* Back button */}
      {/* <BackButton
        color="white"
        style={{
          top: 70,
          left: 16,
          zIndex: 20,
          elevation: 3,
        }}
      /> */}
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
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
              {/* Header */}
              <View style={{ alignItems: 'center', marginBottom: 12, marginTop: 20 }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', letterSpacing: 0.3 }}>
                  About Us
                </Text>
                <Text style={{ marginTop: 20, color: 'white', opacity: 0.9, textAlign: 'center' }}>
                  Learn more about the King/Queen Voting platform
                </Text>
              </View>

              {/* Cards */}
              <View style={{ rowGap: 14 }}>
                {cards.map((c) => (
                  <View
                    key={c.title}
                    style={{
                      backgroundColor: 'transparent',
                      display: 'none',
                      borderRadius: 20,
                      paddingVertical: 1,
                      paddingHorizontal: 1,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.06)',
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 6 },
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      {/* <Text style={{ fontSize: 20, marginRight: 8, }}>{c.icon}</Text> */}
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#222', textAlign: 'center' }}>{c.title}</Text>
                    </View>
                    <Text style={{ color: '#333', fontSize: 15, lineHeight: 32, textAlign: 'justify' }}>{c.body}</Text>
                  </View>
                ))}
              </View>

              {/* Team / Contact */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 25,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.06)',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  marginTop: 14,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#222', textAlign: 'center' }}>Get in Touch</Text>
                <Text style={{ color: '#333', fontSize: 15, marginTop: 15, textAlign: 'center' }}>
                  Questions or feedback?
                </Text>
                <Text style={{ color: '#333', fontSize: 15, marginTop: 15, textAlign: 'center' }}>
                  We’d love to hear from you.
                </Text>
                <View style={{ marginTop: 15, rowGap: 4 }}>
                  <Text style={{ color: '#6a5acd', fontSize: 15, textAlign: 'center', fontWeight: '700', marginTop: 0 }}>Organization: Workify</Text>
                  <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>Email: kyisinthein6940@gamil.com</Text>
                  <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>Phone: +959694033156</Text>
                  <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>🇲🇲 🇺🇸 🇹🇭</Text>
                </View>
              </View>

              {/* Contact Us / For Work */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 25,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.06)',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  marginTop: 14,
                  display: 'none'
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#222', textAlign: 'center' }}>Contact Us / For Work</Text>
                <Text style={{ color: '#555', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                  Reach us directly via phone, email, or Discord.
                </Text>

                <View style={{ marginTop: 14, rowGap: 10 }}>
                  <Pressable
                    onPress={contactPhone}
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.08)',
                    
                    }}
                  >
                    <Text style={{ color: '#222', fontWeight: '700', textAlign: 'center' }}>
                      Phone: +959694033156
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={contactEmail}
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <Text style={{ color: '#222', fontWeight: '700', textAlign: 'center' }}>
                      Email: kyisinthein6940@gmail.com
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={contactDiscord}
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <Text style={{ color: '#222', fontWeight: '700', textAlign: 'center' }}>
                      Discord: https://discordapp.com/users/1377886550133833770
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Contact Us / For Work */}
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderRadius: 24,
                  paddingVertical: 25,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  marginTop: 18,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: 'white', textAlign: 'center' }}>
                  Contact Us / For Work
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 15, textAlign: 'center' }}>
                  Reach us via phone, email, or Discord.
                </Text>

                <View
                  style={{
                    marginTop: 25,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    rowGap: 10,
                    columnGap: 10,
                  }}
                >
                  {/* Phone */}
                  <Pressable
                    onPress={() => copyToClipboard('+959694033156', 'phone')}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.22)',
                      borderRadius: 18,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.45)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      columnGap: 10,
                      minWidth: 140,
                      justifyContent: 'center',
                    }}
                  >
                    {/* <Text style={{ fontSize: 16 }}>📞</Text> */}
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      {copiedKey === 'phone' ? 'Phone ✓ Copied' : 'Phone'}
                    </Text>
                  </Pressable>

                  {/* Email */}
                  <Pressable
                    onPress={() => copyToClipboard('kyisinthein6940@gmail.com', 'email')}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.22)',
                      borderRadius: 18,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.45)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      columnGap: 10,
                      minWidth: 140,
                      justifyContent: 'center',
                    }}
                  >
                    {/* <Text style={{ fontSize: 16 }}>✉️</Text> */}
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      {copiedKey === 'email' ? 'Email ✓ Copied' : 'Email'}
                    </Text>
                  </Pressable>

                  {/* Discord */}
                  <Pressable
                    onPress={() => copyToClipboard('https://discordapp.com/users/1377886550133833770', 'discord')}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.22)',
                      borderRadius: 18,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.45)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      columnGap: 10,
                      minWidth: 160,
                      justifyContent: 'center',
                    }}
                  >
                    {/* <Text style={{ fontSize: 16 }}>🟣</Text> */}
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      {copiedKey === 'discord' ? 'Discord ✓ Copied' : 'Discord'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Footer navigation */}
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
                    onPress={() => router.push('/user-guide')}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 18,
                      backgroundColor: 'transparent',
                      minWidth: 120,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>User Guide</Text>
                  </Pressable>
                </View>
              </View> */}
            </ScrollView>
            {/* Floating actions — render inside the container so it shows */}
            <FloatingActions style={{ position: 'absolute', right: 12, bottom: 24 }} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}