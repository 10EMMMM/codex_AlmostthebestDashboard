"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilePlus } from 'lucide-react';
import CreateUserForm from './create-user-form';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from '@/components/ui/splash-screen';
import { ErrorSplashScreen } from '@/components/ui/error-splash-screen';
import { useToast } from '@/hooks/use-toast';

const allRoles = [
  { value: 'BDR', label: 'BDR' },
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager' },
  { value: 'TEAM_LEAD', label: 'Team Lead' },
];

const UserCardComponent = ({ user, onRoleAssigned, onRoleRemoved }: { user: any, onRoleAssigned: (userId: string, newRole: string) => void, onRoleRemoved: (userId: string, roleToRemove: string) => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase } = useAuth();
  const { toast } = useToast();

  const handleRoleToggle = async (roleValue: string, isAssigned: boolean) => {
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const endpoint = isAssigned ? '/api/admin/remove-role' : '/api/admin/assign-role';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ user_id: user.id, role: roleValue }),
    });

    setIsSubmitting(false);

    if (response.ok) {
      const roleLabel = allRoles.find(r => r.value === roleValue)?.label || roleValue;
      const action = isAssigned ? 'removed' : 'assigned';
      toast({ title: "Success", description: `Role '${roleLabel}' ${action}.` });
      if (isAssigned) {
        onRoleRemoved(user.id, roleValue);
      } else {
        onRoleAssigned(user.id, roleValue);
      }
    } else {
      const responseData = await response.json();
      toast({ title: "Error", description: responseData.error || "Failed to update role.", variant: "destructive" });
    }
  };

  return (
    <div className="widget">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg truncate">{user.display_name || `${user.first_name} ${user.last_name}`}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="text-muted-foreground font-semibold mb-2 text-sm">Manage Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {allRoles.map(role => {
              const isAssigned = user.roles?.includes(role.value);
              return (
                <AlertDialog key={role.value}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={isAssigned ? "secondary" : "outline"}
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (!isAssigned) {
                          handleRoleToggle(role.value, false);
                        }
                      }}
                    >
                      {role.label}
                    </Button>
                  </AlertDialogTrigger>
                  {isAssigned && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the '{role.label}' role from {user.display_name || user.email}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRoleToggle(role.value, true)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserCard = dynamic(() => Promise.resolve(UserCardComponent), { ssr: false });

export default function AdminUsersPage() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const { user, isSuperAdmin, loading, supabase } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchUsers = async () => {
    if (!supabase) return;
    setUsersLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session found for fetching users.");
      setUsersLoading(false);
      return;
    }

    const response = await fetch('/api/admin/get-users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      const { users: fetchedUsers } = await response.json();
      setUsers(fetchedUsers);
    } else {
      console.error("Failed to fetch users:", await response.json());
      setUsers([]);
    }
    
    setUsersLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const handleRoleAssigned = (userId: string, newRole: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId
          ? { ...u, roles: [...(u.roles || []), newRole] }
          : u
      )
    );
  };

  const handleRoleRemoved = (userId: string, roleToRemove: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId
          ? { ...u, roles: u.roles.filter((r: string) => r !== roleToRemove) }
          : u
      )
    );
  };

  if (loading) {
    return <SplashScreen loading={true} />;
  }

  if (!user) {
    return <SplashScreen loading={true} />;
  }

  if (!isSuperAdmin) {
    return (
      <ErrorSplashScreen 
        message="You do not have permission to access this page."
        actionText="Go to Dashboard"
        onActionClick={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <DashboardLayout
      title="Admin - Manage Users"
      actionButton={
        <TooltipProvider>
          <Tooltip>
            <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <TooltipTrigger asChild>
                  <Button size="icon" className="rounded-xl">
                    <FilePlus />
                  </Button>
                </TooltipTrigger>
              </DialogTrigger>
              <TooltipContent>
                <p>Add New User</p>
              </TooltipContent>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <CreateUserForm onCancel={() => {
                  setCreateDialogOpen(false);
                  fetchUsers();
                }} />
              </DialogContent>
            </Dialog>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }} className="w-full h-full">
        <div className="dashboard-grid">
          {usersLoading ? (
            <p>Loading users...</p>
          ) : (
            users.map(u => <UserCard key={u.id} user={u} onRoleAssigned={handleRoleAssigned} onRoleRemoved={handleRoleRemoved} />)
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
