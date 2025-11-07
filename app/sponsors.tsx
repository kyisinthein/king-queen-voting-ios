// Fix imports: use Expo Image only
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { FloatingActions } from '../components/floating-actions';

// type Sponsor and data sections inside the Sponsors() component
type Sponsor = {
  name: string;
  tier: 'Presenting' | 'Platinum' | 'Supporting';
  description?: string;
  logoUrl?: string | null;
  website?: string | null;
};

export default function Sponsors() {
  // Presenting sponsor (Title)
  const presenting: Sponsor[] = [
    {
      name: 'Seinn Yaung So Manufacturing Co., Ltd.',
      tier: 'Presenting',
      description: 'Presenting Sponsor',
      logoUrl: 'https://sys-shop.s3.ap-southeast-1.amazonaws.com/0main/King_Queen/syslogo.png',
      website: null,
    },
  ];

  // Platinum Sponsors — previously “Champion”
  const platinum: Sponsor[] = [
    {
      name: 'Champion Sponsor 1',
      tier: 'Platinum',
      logoUrl: 'https://sys-shop.s3.ap-southeast-1.amazonaws.com/0main/King_Queen/sm.webp',
      website: null,
    },
    {
      name: 'Champion Sponsor 2',
      tier: 'Platinum',
      logoUrl: 'https://sys-shop.s3.ap-southeast-1.amazonaws.com/0main/King_Queen/ww.webp',
      website: null,
    },
  ];

  // Supporting Sponsors — previously “Event”
  const supporting: Sponsor[] = [
    {
      name: 'Supporting Sponsor',
      tier: 'Supporting',
      logoUrl: 'https://sys-shop.s3.ap-southeast-1.amazonaws.com/0main/King_Queen/tkhm.webp',
      website: null,
    },
  ];

  function openLink(url?: string | null) {
    if (!url) return;
    Linking.openURL(url);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Back button */}
      {/* <BackButton
        color="black"
        style={{
          top: 75,
          left: 16,
          zIndex: 20,
          elevation: 3,
        }}
      /> */}
      <View style={{ flex: 1, padding: 20, backgroundColor: 'white', marginTop: 20}}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: '#222',
              textAlign: 'center',
              letterSpacing: 0.3,
            }}
          >
            Our Sponsors
          </Text>
          <Text style={{ marginTop: 15, color: '#555', textAlign: 'center' }}>
            Huge thanks to our partners who make this possible.
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 96, paddingTop: 15 }}>
          {/* Presenting Sponsor */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>PRESENTING SPONSOR</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
            </View>

            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                paddingVertical: 24,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0)',
                alignItems: 'center',
              }}
            >
              {presenting[0]?.logoUrl ? (
                <Image
                  source={{ uri: presenting[0].logoUrl! }}
                  style={{ width: '100%', height: 100 }}
                  contentFit="contain"
                />
              ) : (
                <Text style={{ color: '#777' }}>{presenting[0]?.name}</Text>
              )}
              <Text style={{ marginTop: 12, color: '#333', fontWeight: '700', textAlign: 'center' }}>
                {presenting[0]?.name}
              </Text>
            </View>
          </View>

          {/* Platinum Sponsors */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>PLATINUM SPONSORS</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
            </View>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0)',
              }}
            >
              {platinum.length === 2 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Pressable
                    key={`plat-${platinum[0].name}`}
                    onPress={() => openLink(platinum[0].website)}
                    style={{
                      width: '45%',
                      minHeight: 100,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0)',
                    }}
                  >
                    {platinum[0].logoUrl ? (
                      <Image source={{ uri: platinum[0].logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />
                    ) : (
                      <Text style={{ color: '#333', fontWeight: '700' }}>{platinum[0].name}</Text>
                    )}
                  </Pressable>

                  {/* Vertical divider between the two images */}
                  <View
                    style={{
                      width: 1,
                      alignSelf: 'stretch',
                      backgroundColor: '#a6cdf4ff',
                      marginHorizontal: 8,
                    }}
                  />

                  <Pressable
                    key={`plat-${platinum[1].name}`}
                    onPress={() => openLink(platinum[1].website)}
                    style={{
                      width: '45%',
                      minHeight: 100,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0)',
                    }}
                  >
                    {platinum[1].logoUrl ? (
                      <Image source={{ uri: platinum[1].logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />
                    ) : (
                      <Text style={{ color: '#333', fontWeight: '700' }}>{platinum[1].name}</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 12 }}>
                  {platinum.map((s) => (
                    <Pressable
                      key={`plat-${s.name}`}
                      onPress={() => openLink(s.website)}
                      style={{
                        width: '45%',
                        minHeight: 100,
                        backgroundColor: 'white',
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.08)',
                      }}
                    >
                      {s.logoUrl ? (
                        <Image source={{ uri: s.logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />
                      ) : (
                        <Text style={{ color: '#333', fontWeight: '700' }}>{s.name}</Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Supporting Sponsors */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>SUPPORTING SPONSORS</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
            </View>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0)',
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 12 }}>
                {supporting.map((s) => (
                  <Pressable
                    key={`supp-${s.name}`}
                    onPress={() => openLink(s.website)}
                    style={{
                      width: '45%',
                      minHeight: 100,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0)',
                    }}
                  >
                    {s.logoUrl ? (
                      <Image source={{ uri: s.logoUrl }} style={{ width: '100%', height: 150 }} contentFit="contain" />
                    ) : (
                      <Text style={{ color: '#333', fontWeight: '700' }}>{s.name}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* CTA: Become a sponsor */}
          {/* <View style={{ marginTop: 4, alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                columnGap: 12,
                backgroundColor: '#f4f6ff',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#dde3ff',
                padding: 8,
              }}
            >
              <Pressable
                onPress={() => Linking.openURL('mailto:kyisinthein6940@gamil.com?subject=Sponsor%20Inquiry')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: '#1e90ff',
                  minWidth: 160,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Become a Sponsor</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/about')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: 'transparent',
                  minWidth: 120,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#1e90ff', fontWeight: '700' }}>About Us</Text>
              </Pressable>
            </View>
          </View> */}
        </ScrollView>

        <FloatingActions style={{ position: 'absolute', right: 12, bottom: 24 }} />
      </View>
    </SafeAreaView>
  );
}