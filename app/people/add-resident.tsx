import { Redirect } from 'expo-router';

export default function AddResidentLegacyScreen() {
  return <Redirect href="/people/access-form?type=RESIDENT" />;
}
