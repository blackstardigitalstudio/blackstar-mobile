import React, { forwardRef, useRef } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

// MOBILE build: FocusList is just a FlatList (native touch scrolling). useListScroll
// returns no-op handlers so screens that wire them up keep working.
export const FocusList = forwardRef<FlatList<any>, FlatListProps<any>>(function FocusList(props, ref) {
  return <FlatList ref={ref} {...props} />;
});

const noop = () => {};

export function useListScroll(_horizontal = false) {
  const ref = useRef<FlatList<any>>(null);
  return { ref, onScroll: noop, onLayout: noop, reveal: noop };
}
