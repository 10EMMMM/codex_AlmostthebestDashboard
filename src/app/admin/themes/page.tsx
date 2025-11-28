'use client';

/**
 * Theme Management Admin Page
 * 
 * Comprehensive CRUD interface for managing themes with:
 * - Visual theme cards with live previews
 * - Create/Edit modals with color pickers
 * - Theme usage statistics
 * - Organization default theme setting
 * - Soft delete/activate functionality
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getAllThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    getThemeUsageStats,
} from '@/lib/theme-config';
import type { Theme } from '@/lib/types/theme';
import { ThemeEditorModal } from '@/components/features/theme/theme-editor';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Palette, Plus, Edit, Trash2, Users, TrendingUp, Sparkles, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ThemeAdminPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [stats, setStats] = useState<Array<{ theme_id: string; theme_name: string; user_count: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Load themes and stats
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [themesData, statsData] = await Promise.all([
                getAllThemes(),
                getThemeUsageStats(),
            ]);
            setThemes(themesData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading themes:', error);
            toast({
                title: 'Error',
                description: 'Failed to load themes',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTheme = () => {
        setEditingTheme(null);
        setIsCreateModalOpen(true);
    };

    const handleEditTheme = (theme: Theme) => {
        setEditingTheme(theme);
        setIsCreateModalOpen(true);
    };

    const handleDeleteTheme = async () => {
        if (!deletingTheme) return;

        try {
            const success = await deleteTheme(deletingTheme.id);
            if (success) {
                toast({
                    title: 'Success',
                    description: `Theme "${deletingTheme.name}" has been deactivated`,
                });
                loadData();
            } else {
                throw new Error('Failed to delete theme');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete theme',
                variant: 'destructive',
            });
        } finally {
            setDeletingTheme(null);
        }
    };

    const getUserCount = (themeId: string) => {
        return stats.find(s => s.theme_id === themeId)?.user_count || 0;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-primary" />
                            Theme Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Create, edit, and manage themes for your organization
                        </p>
                    </div>
                    <Button onClick={handleCreateTheme} size="lg">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Theme
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
                        <Palette className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{themes.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active theme variations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users with Themes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, s) => acc + s.user_count, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total customized preferences
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.length > 0 ? stats[0].theme_name : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.length > 0 ? `${stats[0].user_count} users` : 'No data yet'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Theme Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        userCount={getUserCount(theme.id)}
                        onEdit={() => handleEditTheme(theme)}
                        onDelete={() => setDeletingTheme(theme)}
                    />
                ))}
            </div>

            {/* Create/Edit Modal */}
            <ThemeEditorModal
                theme={editingTheme}
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingTheme(null);
                }}
                onSave={loadData}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingTheme} onOpenChange={() => setDeletingTheme(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Theme?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate "{deletingTheme?.name}"? Users will no longer be able to select this theme.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTheme} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Theme Card Component
function ThemeCard({
    theme,
    userCount,
    onEdit,
    onDelete,
}: {
    theme: Theme;
    userCount: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const colors = theme.config.colors;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        {theme.name}
                        {theme.is_system_default && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                Default
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={onEdit}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        {!theme.is_system_default && (
                            <Button variant="ghost" size="icon" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>
                {theme.description && (
                    <CardDescription>{theme.description}</CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Color swatches */}
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Request Types</div>
                    <div className="flex gap-1">
                        <div
                            className="h-10 flex-1 rounded border"
                            style={{ backgroundColor: colors.requestTypes.restaurant }}
                            title="Restaurant"
                        />
                        <div
                            className="h-10 flex-1 rounded border"
                            style={{ backgroundColor: colors.requestTypes.event }}
                            title="Event"
                        />
                        <div
                            className="h-10 flex-1 rounded border"
                            style={{ backgroundColor: colors.requestTypes.cuisine }}
                            title="Cuisine"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Status Gradients</div>
                    <div className="grid grid-cols-2 gap-1">
                        <div
                            className="h-8 rounded border"
                            style={{
                                background: `linear-gradient(to right, ${colors.requestStatuses.new[0]}, ${colors.requestStatuses.new[1]})`
                            }}
                            title="New"
                        />
                        <div
                            className="h-8 rounded border"
                            style={{
                                background: `linear-gradient(to right, ${colors.requestStatuses.ongoing[0]}, ${colors.requestStatuses.ongoing[1]})`
                            }}
                            title="Ongoing"
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="text-sm text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {userCount} {userCount === 1 ? 'user' : 'users'}
                </span>
                <span className="text-xs">
                    Created {new Date(theme.created_at).toLocaleDateString()}
                </span>
            </CardFooter>
        </Card>
    );
}


