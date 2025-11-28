'use client';

/**
 * Theme Editor Component
 * 
 * Visual editor for creating and modifying themes with color pickers.
 * Provides an intuitive interface for editing theme configurations.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createTheme, updateTheme } from '@/lib/theme-config';
import type { Theme, ThemeConfig } from '@/lib/types/theme';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ThemeEditorProps {
    theme: Theme | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

// Default theme config template
const DEFAULT_CONFIG: ThemeConfig = {
    colors: {
        requestTypes: {
            restaurant: '#10b981',
            event: '#3b82f6',
            cuisine: '#a855f7',
        },
        requestStatuses: {
            new: ['#a855f7', '#ec4899'],
            ongoing: ['#3b82f6', '#06b6d4'],
            onHold: ['#f97316', '#f59e0b'],
            done: ['#22c55e', '#10b981'],
            cancelled: '#6b7280',
            closed: '#64748b',
        },
        restaurantStatuses: {
            new: '#3b82f6',
            onProgress: '#eab308',
            onHold: '#6b7280',
            done: '#22c55e',
        },
        wizard: {
            primary: '#f97316',
            secondary: '#fdba74',
            inactive: '#d1d5db',
        },
        toasts: {
            success: {
                border: '#10b981',
                bg: '#ecfdf5',
                text: '#064e3b',
                action: '#059669',
            },
            info: {
                border: '#0ea5e9',
                bg: '#f0f9ff',
                text: '#0c4a6e',
                action: '#0284c7',
            },
            warning: {
                border: '#f59e0b',
                bg: '#fffbeb',
                text: '#78350f',
                action: '#d97706',
            },
        },
        accents: {
            bdr: '#3b82f6',
            cuisine: '#a855f7',
            deadline: '#f97316',
            overdue: '#ef4444',
        },
    },
    backgroundImage: {
        login: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80',
        dashboard: '',
    },
};

export function ThemeEditorModal({ theme, isOpen, onClose, onSave }: ThemeEditorProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);

    // Initialize form when theme changes
    useEffect(() => {
        if (theme) {
            setName(theme.name);
            setDescription(theme.description || '');
            setConfig(theme.config);
        } else {
            setName('');
            setDescription('');
            setConfig(DEFAULT_CONFIG);
        }
    }, [theme]);

    const handleColorChange = (path: string, value: string) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            const keys = path.split('.');
            let current: any = newConfig;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
    };

    const handleGradientChange = (path: string, index: number, value: string) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            const keys = path.split('.');
            let current: any = newConfig;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            const gradient = [...current[keys[keys.length - 1]]];
            gradient[index] = value;
            current[keys[keys.length - 1]] = gradient;
            return newConfig;
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast({
                title: 'Error',
                description: 'Theme name is required',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            if (theme) {
                // Update existing theme
                const success = await updateTheme(theme.id, {
                    name,
                    description,
                    config,
                });

                if (success) {
                    toast({
                        title: 'Success',
                        description: 'Theme updated successfully',
                    });
                    onSave();
                    onClose();
                }
            } else {
                // Create new theme
                const newTheme = await createTheme({
                    name,
                    description,
                    config,
                    is_system_default: false,
                    is_active: true,
                    created_by: user?.id,
                });

                if (newTheme) {
                    toast({
                        title: 'Success',
                        description: 'Theme created successfully',
                    });
                    onSave();
                    onClose();
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save theme',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {theme ? 'Edit Theme' : 'Create New Theme'}
                    </DialogTitle>
                    <DialogDescription>
                        Customize colors and backgrounds for your theme
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Theme Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Midnight"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief description of your theme..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Color Configuration */}
                    <Tabs defaultValue="request-types" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="request-types">Request Types</TabsTrigger>
                            <TabsTrigger value="statuses">Statuses</TabsTrigger>
                            <TabsTrigger value="accents">Accents</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                        </TabsList>

                        {/* Request Types Tab */}
                        <TabsContent value="request-types" className="space-y-4">
                            <ColorInput
                                label="Restaurant"
                                value={config.colors.requestTypes.restaurant}
                                onChange={(v) => handleColorChange('colors.requestTypes.restaurant', v)}
                            />
                            <ColorInput
                                label="Event"
                                value={config.colors.requestTypes.event}
                                onChange={(v) => handleColorChange('colors.requestTypes.event', v)}
                            />
                            <ColorInput
                                label="Cuisine"
                                value={config.colors.requestTypes.cuisine}
                                onChange={(v) => handleColorChange('colors.requestTypes.cuisine', v)}
                            />
                        </TabsContent>

                        {/* Statuses Tab */}
                        <TabsContent value="statuses" className="space-y-4">
                            <div>
                                <Label>New Status (Gradient)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <ColorInput
                                        label="From"
                                        value={config.colors.requestStatuses.new[0]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.new', 0, v)}
                                    />
                                    <ColorInput
                                        label="To"
                                        value={config.colors.requestStatuses.new[1]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.new', 1, v)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Ongoing Status (Gradient)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <ColorInput
                                        label="From"
                                        value={config.colors.requestStatuses.ongoing[0]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.ongoing', 0, v)}
                                    />
                                    <ColorInput
                                        label="To"
                                        value={config.colors.requestStatuses.ongoing[1]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.ongoing', 1, v)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Done Status (Gradient)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <ColorInput
                                        label="From"
                                        value={config.colors.requestStatuses.done[0]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.done', 0, v)}
                                    />
                                    <ColorInput
                                        label="To"
                                        value={config.colors.requestStatuses.done[1]}
                                        onChange={(v) => handleGradientChange('colors.requestStatuses.done', 1, v)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Accents Tab */}
                        <TabsContent value="accents" className="space-y-4">
                            <ColorInput
                                label="BDR"
                                value={config.colors.accents.bdr}
                                onChange={(v) => handleColorChange('colors.accents.bdr', v)}
                            />
                            <ColorInput
                                label="Cuisine"
                                value={config.colors.accents.cuisine}
                                onChange={(v) => handleColorChange('colors.accents.cuisine', v)}
                            />
                            <ColorInput
                                label="Deadline"
                                value={config.colors.accents.deadline}
                                onChange={(v) => handleColorChange('colors.accents.deadline', v)}
                            />
                            <ColorInput
                                label="Overdue"
                                value={config.colors.accents.overdue}
                                onChange={(v) => handleColorChange('colors.accents.overdue', v)}
                            />
                        </TabsContent>

                        {/* Background Images Tab */}
                        <TabsContent value="images" className="space-y-4">
                            <div>
                                <Label htmlFor="login-bg">Login Background URL</Label>
                                <Input
                                    id="login-bg"
                                    value={config.backgroundImage.login}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        backgroundImage: { ...prev.backgroundImage, login: e.target.value }
                                    }))}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="dashboard-bg">Dashboard Background URL</Label>
                                <Input
                                    id="dashboard-bg"
                                    value={config.backgroundImage.dashboard}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        backgroundImage: { ...prev.backgroundImage, dashboard: e.target.value }
                                    }))}
                                    placeholder="https://..."
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {theme ? 'Update Theme' : 'Create Theme'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Color Input Component with Picker
function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1">
                <Label className="text-sm">{label}</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1 font-mono text-sm"
                    />
                </div>
            </div>
            <div
                className="w-12 h-10 rounded border-2 border-gray-200"
                style={{ backgroundColor: value }}
                title={`Preview: ${value}`}
            />
        </div>
    );
}
