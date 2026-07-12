import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

// MOBILE build: plain ScrollView with native touch scrolling. No focus-follow.
export function FocusScrollView({ children, ...rest }: ScrollViewProps & { children: React.ReactNode }) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} {...rest}>
      {children}
    </ScrollView>
  );
}

export const useFocusScroll = () => null;
