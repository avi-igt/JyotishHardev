import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function KundliRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
