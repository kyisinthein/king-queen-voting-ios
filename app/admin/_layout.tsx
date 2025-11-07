import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="results" />
      {/* Add candidates management to the stack */}
      <Stack.Screen name="candidates" />
      {/* Add categories management to the stack */}
      <Stack.Screen name="categories" />
      {/* Add export data to the stack */}
      <Stack.Screen name="export" />
      <Stack.Screen name="index" />
    </Stack>
  );
}