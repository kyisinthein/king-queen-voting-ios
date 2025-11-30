// Fix imports: use Expo Image only
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

  // No other tiers on this screen

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#f7faff", "#ffffff"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, marginTop: 95 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 24,
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
          <View style={{ marginBottom: 24, marginTop: 30 }}>
            <View style={{ alignSelf: 'center', backgroundColor: '#eaf2ff', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 10, marginTop: 10 }}>
              <Text style={{ color: '#1e90ff', fontSize: 13, fontWeight: '800' }}>PRESENTED BY</Text>
            </View>

            <View
              style={{
                backgroundColor: 'transparent',
                marginTop: 25,
                // borderRadius: 18,
                paddingVertical: 14,
                paddingHorizontal: 20,
                // borderWidth: 1,
                // borderColor: '#dde3ff',
                // alignItems: 'center',
                // shadowColor: '#000',
                // shadowOpacity: 0.08,
                // shadowRadius: 12,
                // shadowOffset: { width: 0, height: 6 },
                // elevation: 3,
              }}
            >
              {presenting[0]?.logoUrl ? (
                <Image
                  source={{ uri: presenting[0].logoUrl! }}
                  style={{ width: '100%', height: 200 }}
                  contentFit="contain"
                />
              ) : (
                <Text style={{ color: '#777' }}>{presenting[0]?.name}</Text>
              )}
              <Text style={{ marginTop: 50, color: '#222', fontWeight: '800', textAlign: 'center' }}>
                {presenting[0]?.name}
              </Text>
              <Pressable onPress={() => Linking.openURL('https://seinnyaungso.com/')} style={{ marginTop: 50 }}>
                <Text style={{ color: '#1e90ff', textAlign: 'center' }}>seinnyaungso.com</Text>
              </Pressable>
            </View>
          </View>

          {/* Removed Platinum and Supporting sections */}

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
      </LinearGradient>

      {/* Countdown to Home — bottom-fixed inside SafeAreaView */}
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 50 }}>
        <View style={{ alignSelf: 'center', backgroundColor: 'transparent', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 0 }}>
          <Text style={{ color: '#1e90ff', fontWeight: '700' }}>Home in {remaining}s</Text>
        </View>
        <View style={{ width: '100%', height: 10, backgroundColor: '#eaf2ff', borderRadius: 20, overflow: 'hidden', marginTop: 8 }}>
          <Animated.View style={{ width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height: '100%', backgroundColor: '#1e90ff' }} />
        </View>
      </View>
    </SafeAreaView>
  );
}
