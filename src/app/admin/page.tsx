"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/ui/splash-screen';

function RestaurantOnboardCsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { supabase } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setStatusMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatusMessage('Error: You must be logged in to perform this action.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/restaurants/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        setStatusMessage(`Successfully uploaded ${payload?.inserted ?? 0} records.`);
        setFile(null);
      } else {
        setStatusMessage(payload?.error ?? 'Failed to upload CSV.');
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unexpected error uploading CSV.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">Onboard Restaurants via CSV</h2>
      <div className="flex items-center gap-4">
        <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs" />
        <Button onClick={handleUpload} disabled={isUploading || !file}>
          {isUploading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </div>
      {statusMessage && <p className="mt-4 text-sm text-muted-foreground">{statusMessage}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        CSV must have the following columns: <strong>name</strong>, <strong>city_id</strong> (optional), <strong>primary_cuisine_id</strong> (optional).
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase, hasAdminAccess, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/get-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.users) {
        const superAdmins = payload.users.filter((user: any) => user.app_metadata?.is_super_admin === true);
        setUsers(superAdmins);
      }

      setIsLoading(false);
    };

    if (hasAdminAccess) {
      fetchAdminData();
    } else if (!loading) {
      router.push('/dashboard');
    }
  }, [router, supabase, hasAdminAccess, loading]);

  if (loading || isLoading) {
    return (
      <SplashScreen loading />
    );
  }

  return (
    <DashboardLayout title="Admin">
      <RestaurantOnboardCsvUpload />
      <h1 className="text-2xl font-bold mb-4">Admin - Super Admins</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.is_super_admin ? 'Super Admin' : 'Regular User'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
}
