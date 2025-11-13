"use client";

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
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
import Papa from 'papaparse';

import { DashboardLayout } from '@/components/dashboard-layout';

function RestaurantOnboardCsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const supabase = getSupabaseClient();

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
    setStatusMessage('Parsing CSV file...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatusMessage('Error: You must be logged in to perform this action.');
      setIsUploading(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setStatusMessage('CSV parsed. Inserting data into the database...');
        const parsedData = results.data as Array<Record<string, any>>;

        const recordsToInsert = parsedData.map(row => ({
          name: row.name,
          city_id: row.city_id || null,
          primary_cuisine_id: row.primary_cuisine_id || null,
          onboarded_by: user.id,
          onboarded_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('restaurants')
          .insert(recordsToInsert);

        if (error) {
          setStatusMessage(`Error inserting data: ${error.message}`);
        } else {
          setStatusMessage(`Successfully uploaded and inserted ${recordsToInsert.length} records.`);
        }
        setIsUploading(false);
        setFile(null); 
      },
      error: (error) => {
        setStatusMessage(`Error parsing CSV: ${error.message}`);
        setIsUploading(false);
      },
    });
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
  const supabase = getSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        if (!user.app_metadata.is_super_admin) {
          router.push('/dashboard');
          return;
        }
        
        // If the user is a super admin, fetch the list of all super admins from auth.users.
        const { data, error: usersError } = await supabase.from('users').select('id, email, is_super_admin').eq('is_super_admin', true);
        
        if (data) {
          setUsers(data);
        }
        setIsLoading(false);

      } else {
        // This case should not be reached due to middleware, but as a fallback.
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <DashboardLayout title="Admin">
        <div>Loading...</div>
      </DashboardLayout>
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
