import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

// MOBILE build: a plain tappable Pressable. Keeps the box `Focusable` prop
// surface (onSelect/onFocus/focusStyle/autoFocus/disabled + render-prop) so all
// existing screens work unchanged — they just respond to taps. The render prop
// receives (focused=false, focusSelf=noop) since there is no D-pad focus.

interface Props {
  onSelect?: () => void;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  focusKey?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  children: React.ReactNode | ((focused: boolean, focusSelf: () => void) => React.ReactNode);
}

const noop = () => {};

export function Focusable({ onSelect, style, disabled, children }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onSelect}
      android_ripple={{ color: 'rgba(217,70,239,0.18)' }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {typeof children === 'function' ? (children as any)(false, noop) : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
