'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns false during SSR and the component's hydration pass, then true once
 * React can safely render browser-only state.
 */
export const useHydrated = () => useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
