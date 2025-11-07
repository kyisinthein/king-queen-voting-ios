import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';

type Action = { label: string; icon: string; href: string };

const ACTIONS: Action[] = [
  { label: 'Home',       icon: 'house.fill',        href: '/home' },
  { label: 'Sponsors',   icon: 'star.fill',         href: '/sponsors' },
  { label: 'User Guide', icon: 'book.fill',         href: '/guide' },
  { label: 'Live Results', icon: 'chart.bar.fill',  href: '/results' },
  { label: 'About us',   icon: 'info.circle.fill',  href: '/about' },
  { label: 'Admin',      icon: 'lock.fill',         href: '/admin/login' },
];

export function QuickActions({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
          <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.label}
                onPress={() => {
                  onClose();
                  router.push(a.href as any);
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
                <IconSymbol name={a.icon as any} color="#333" size={22} />
                <Text style={{ marginTop: 6, fontWeight: '600' }}>{a.label}</Text>
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