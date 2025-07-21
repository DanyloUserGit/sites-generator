import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getToken } from '../lib/auth';

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    }
  }, [router]);
}
