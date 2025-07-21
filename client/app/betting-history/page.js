'use client';

import BettingHistoryPage from '@/components/betting/BettingHistoryPage';
import withAuth from '@/components/auth/withAuth';
import { useSearchParams } from 'next/navigation';


const ProtectedBettingHistoryPage = withAuth(BettingHistoryPage);

export default function BettingPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  return <ProtectedBettingHistoryPage userId={userId} />;
}
