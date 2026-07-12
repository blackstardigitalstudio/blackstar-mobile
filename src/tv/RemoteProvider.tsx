import React, { createContext, useContext } from 'react';

// MOBILE (touch) build: there is no D-pad focus engine — native touch handles
// focus/press. These are no-op shims so every screen written for the box build
// keeps compiling and works with taps. Same surface as the box engine.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type RemoteKey = string;
type KeyHandler = (key: RemoteKey) => boolean | void;

const noop = (..._a: any[]) => {};

const ctx = {
  register: noop,
  unregister: noop,
  requestFocus: noop,
  reportRect: noop,
  subscribe: () => noop,
  pushHandler: () => noop,
  dispatch: noop,
  setPointerMode: noop,
  activateLayer: noop,
  deactivateLayer: noop,
};

const Ctx = createContext(ctx);
export const FocusLayerContext = createContext<number>(0);

export function RemoteProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useRemote() {
  return useContext(Ctx);
}

export function useKeyHandler(_handler: KeyHandler, _deps: React.DependencyList = []) {
  // no hardware keys on a phone
}

export function useFocusLayer() {
  return 0;
}

/** Modals don't need a focus trap on touch — just render the content. */
export function FocusLayer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
