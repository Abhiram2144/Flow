import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add" options={{ presentation: 'card' }} />
      <Stack.Screen name="budget" options={{ presentation: 'card' }} />
      <Stack.Screen name="ai-advice" options={{ presentation: 'card' }} />
    </Stack>
  );
}
