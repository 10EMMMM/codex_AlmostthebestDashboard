"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function BDRPage() {
  const [bdrUsers, setBdrUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchBdrUsers = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, user:users(*)')
        .eq('role', 'BDR');

      if (data) {
        setBdrUsers(data);
      }
      setIsLoading(false);
    };

    fetchBdrUsers();
  }, [supabase]);

  if (isLoading) {
    return (
      <DashboardLayout title="BDR Users">
        <div>Loading BDR Users...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="BDR Users">
      <CardDescription>A list of all users with the BDR role.</CardDescription>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {bdrUsers.map((bdrUser) => (
          <Card key={bdrUser.user_id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={bdrUser.user?.user_metadata?.avatar_url} />
                <AvatarFallback>{bdrUser.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{bdrUser.user?.user_metadata?.full_name || bdrUser.user?.email}</CardTitle>
                <CardDescription>{bdrUser.user?.email}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

