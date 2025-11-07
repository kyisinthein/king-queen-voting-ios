import { useState } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { QuickActions } from '@/components/quick-actions';

export function FloatingActions({ style }: { style?: ViewStyle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          {
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: [{ translateY: -24 }],
            width: 48,
            height: 48,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: '#A7D8D8',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            zIndex: 100,
          },
          style,
        ]}>
        <IconSymbol name="gearshape.fill" color="#3E5C5C" size={20} />
      </Pressable>

      <QuickActions visible={open} onClose={() => setOpen(false)} />
    </>
  );
}