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
      <View style={{ flex: 1, padding: 20, backgroundColor: 'white', marginTop: 40}}>
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
                paddingVertical: 30,
                paddingHorizontal: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0)',
                alignItems: 'center',
              }}
            >
              {presenting[0]?.logoUrl ? (
                <Image
                  source={{ uri: presenting[0].logoUrl! }}
                  style={{ width: '100%', height: 150 }}
                  contentFit="contain"
                />
              ) : (
                <Text style={{ color: '#777' }}>{presenting[0]?.name}</Text>
              )}
              <Text style={{ marginTop: 50, color: '#333', fontWeight: '800', textAlign: 'center' }}>
                {presenting[0]?.name}
              </Text>
              <Pressable
                onPress={() => Linking.openURL('https://seinnyaungso.com/')}
                style={{ marginTop: 14 }}
              >
                <Text style={{ color: '#333', textAlign: 'justify', lineHeight: 20, marginTop: 20 }}>
                  Seinn Yaung So Manufacturing Co., Ltd. was established as an expansion of 007 Zero Zero Seven Trading Co., Ltd., which has been operating in Myanmar since 1989. With over three decades of experience, we have grown to become one of the leading suppliers of agricultural machinery in the Myanmar market. Our operations span distribution, wholesale, aftersales service, and spare parts support nationwide.
                </Text>
                <Text style={{ color: '#1e90ff', textAlign: 'center', marginTop: 30 }}>seinnyaungso.com</Text>
              </Pressable>
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
