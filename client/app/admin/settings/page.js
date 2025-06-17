'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { selectUser, selectIsAuthenticated } from '@/lib/features/auth/authSlice';

export default function AdminSettings() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  if (user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">General settings will be implemented here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Security settings will be implemented here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Notification settings will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 