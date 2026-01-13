import { Redirect } from 'expo-router';

// Root simply funnels into the splash gate.
export default function Index() {
  return <Redirect href="/splash" />;
}