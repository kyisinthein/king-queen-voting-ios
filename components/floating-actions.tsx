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
            right: 16,
            top: '50%',
            transform: [{ translateY: -28 }], // center vertically for 56dp height
            width: 56,
            height: 56,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
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