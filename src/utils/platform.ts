// utils/platform.ts
import { Platform as RNPlatform } from 'react-native';
import { isTauri } from '@tauri-apps/api/core';
import { Platform } from '../types';

export const getCurrentPlatform = (): Platform => {
  if (RNPlatform.OS === 'web') {
    return isTauri() ? 'desktop' : 'web';
  }
  return 'mobile';
}