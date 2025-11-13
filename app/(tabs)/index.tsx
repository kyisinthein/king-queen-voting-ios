// Fix imports: use Expo Image only
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Animated, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

// type Partner and data sections inside the Partners() component
type Partner = {
  name: string;
  tier: 'Presenting' | 'Platinum' | 'Supporting';
  description?: string;
  logoUrl?: string | null;
  website?: string | null;
};

export default function Partners() {
  // Auto-navigate to Home after 5 seconds
  const [remaining, setRemaining] = React.useState(6);
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const countdown = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    Animated.timing(progress, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      router.replace('/home');
    }, 6000);

    return () => {
      clearInterval(countdown);
      clearTimeout(t);
    };
  }, []);

  // Presenting sponsor (Title)
  const presenting: Partner[] = [
    {
      name: 'Seinn Yaung So Manufacturing Co., Ltd.',
      tier: 'Presenting',
      description: 'Presenting Sponsor',
      logoUrl: 'https://sys-shop.s3.ap-southeast-1.amazonaws.com/0main/King_Queen/syslogo.png',
      website: null,
    },
  ];

  // Platinum Sponsors — previously "Champion"
  const platinum: Partner[] = [
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

  // Supporting Sponsors — previously "Event"
  const supporting: Partner[] = [
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
      <View style={{ flex: 1, padding: 20, backgroundColor: 'white', marginTop: 20 }}>
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
            Our Partners
          </Text>
          {/* <Text style={{ marginTop: 6, color: '#555', textAlign: 'center' }}>
            Huge thanks to our partners who make this possible.
          </Text> */}
        </View>

        {/* Removed countdown from here */}

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Presenting Sponsor */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>PRESENTING PARTNER</Text>
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
                  style={{ width: '100%', height: 130 }}
                  contentFit="contain"
                />
              ) : (
                <Text style={{ color: '#777' }}>{presenting[0]?.name}</Text>
              )}
              {/* <Text style={{ marginTop: 12, color: '#333', fontWeight: '700', textAlign: 'center' }}>
                {presenting[0]?.name}
              </Text> */}
            </View>
          </View>

          {/* Platinum Sponsors */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#1e90ff' }} />
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>PLATINUM PARTNERS</Text>
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
                      minHeight: 110,
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
                      <Image source={{ uri: platinum[0].logoUrl }} style={{ width: '100%', height: 120 }} contentFit="contain" />
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
                      minHeight: 110,
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
                      <Image source={{ uri: platinum[1].logoUrl }} style={{ width: '100%', height: 110 }} contentFit="contain" />
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
                        minHeight: 110,
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
                        <Image source={{ uri: s.logoUrl }} style={{ width: '100%', height: 110 }} contentFit="contain" />
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
              <Text style={{ color: '#1e90ff', fontSize: 14, fontWeight: '800' }}>SUPPORTING PARTNERS</Text>
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
                      minHeight: 110,
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
                      <Image source={{ uri: s.logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />
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
                onPress={() => Linking.openURL('mailto:kyisinthein6940@gmail.com?subject=Partner%20Inquiry')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: '#1e90ff',
                  minWidth: 160,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Become a Partner</Text>
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
      </View>

      {/* Countdown to Home — bottom-fixed inside SafeAreaView */}
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 50 }}>
        <View style={{ alignSelf: 'center' }}>
          <Text style={{ color: '#1e90ff', fontWeight: '600', marginBottom: 10 }}>
            Home Page in {remaining}s
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            height: 10,
            backgroundColor: '#eaf2ff',
            borderRadius: 20,
            overflow: 'hidden',
            marginTop: 10,
          }}
        >
          <Animated.View
            style={{
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height: '100%',
              backgroundColor: '#1e90ff',
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}