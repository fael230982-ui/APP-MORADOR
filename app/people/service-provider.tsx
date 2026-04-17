import { Redirect, useLocalSearchParams } from 'expo-router';

function mapLegacyType(value?: string | string[]) {
  const text = Array.isArray(value) ? value[0] : value;
  if (text === 'VISITANTE') return 'VISITOR';
  if (text === 'ALUGANTE') return 'RENTER';
  return 'SERVICE_PROVIDER';
}

export default function ServiceProviderLegacyScreen() {
  const { type } = useLocalSearchParams<{ type?: string | string[] }>();
  return <Redirect href={`/people/access-form?type=${mapLegacyType(type)}`} />;
}
