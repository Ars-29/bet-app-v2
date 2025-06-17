import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/lib/features/auth/authSlice';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // Set loading to false once we have the authentication state
    setLoading(false);
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    loading,
  };
} 