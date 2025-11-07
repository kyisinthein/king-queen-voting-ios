import * as SecureStore from 'expo-secure-store';

const KEY = 'device_id_v1';

function randomId() {
  const part = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${part()}-${part()}`;
}

export async function getDeviceId() {
  try {
    const existing = await SecureStore.getItemAsync(KEY);
    if (existing) return existing;
    const id = randomId();
    await SecureStore.setItemAsync(KEY, id);
    return id;
  } catch {
    // Fallback if SecureStore fails
    return randomId();
  }
}