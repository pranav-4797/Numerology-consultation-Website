'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
