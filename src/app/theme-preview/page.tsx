'use client';

/**
 * Theme Preview Page
 * 
 * Showcases all UI components with the currently active theme.
 * Useful for testing theme appearance and demonstrating color schemes.
 */

import React from 'react';
import { useTheme, useThemeColors } from '@/components/providers/theme-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle2,
    Clock,
    Pause,
    XCircle,
    AlertTriangle,
    Info,
    Sparkles,
    TrendingUp,
    Users,
    MapPin,
    Calendar,
} from 'lucide-react';

export default function ThemePreviewPage() {
    const { currentTheme } = useTheme();
    const colors = useThemeColors();

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <Sparkles className="h-10 w-10" style={{ color: colors.wizard.primary }} />
                    Theme Preview: {currentTheme.name}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {currentTheme.description || 'Comprehensive showcase of all UI components'}
                </p>
            </div>

            <div className="space-y-8">
                {/* Request Types */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Request Types</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card
                            className="border-l-4"
                            style={{ borderLeftColor: colors.requestTypes.restaurant }}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">Restaurant Request</CardTitle>
                                <CardDescription>New restaurant onboarding</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: colors.requestTypes.restaurant }}
                                    />
                                    <span className="text-sm font-medium">Active Color</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="border-l-4"
                            style={{ borderLeftColor: colors.requestTypes.event }}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">Event Request</CardTitle>
                                <CardDescription>Catering event booking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: colors.requestTypes.event }}
                                    />
                                    <span className="text-sm font-medium">Active Color</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="border-l-4"
                            style={{ borderLeftColor: colors.requestTypes.cuisine }}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">Cuisine Request</CardTitle>
                                <CardDescription>Cuisine expansion</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: colors.requestTypes.cuisine }}
                                    />
                                    <span className="text-sm font-medium">Active Color</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator />

                {/* Request Statuses */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Request Statuses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    New
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.requestStatuses.new[0]}, ${colors.requestStatuses.new[1]})`
                                    }}
                                >
                                    Gradient Badge
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Ongoing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.requestStatuses.ongoing[0]}, ${colors.requestStatuses.ongoing[1]})`
                                    }}
                                >
                                    Gradient Badge
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Done
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.requestStatuses.done[0]}, ${colors.requestStatuses.done[1]})`
                                    }}
                                >
                                    Gradient Badge
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator />

                {/* Accents & Badges */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Accent Colors & Badges</h2>
                    <div className="flex flex-wrap gap-3">
                        <Badge
                            className="px-4 py-2 text-white"
                            style={{ backgroundColor: colors.accents.bdr }}
                        >
                            BDR Assignment
                        </Badge>
                        <Badge
                            className="px-4 py-2 text-white"
                            style={{ backgroundColor: colors.accents.cuisine }}
                        >
                            Cuisine Type
                        </Badge>
                        <Badge
                            className="px-4 py-2 text-white"
                            style={{ backgroundColor: colors.accents.deadline }}
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            Deadline
                        </Badge>
                        <Badge
                            className="px-4 py-2 text-white"
                            style={{ backgroundColor: colors.accents.overdue }}
                        >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Overdue
                        </Badge>
                    </div>
                </section>

                <Separator />

                {/* Wizard Steps */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Wizard Progress</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: colors.wizard.primary }}
                            >
                                1
                            </div>
                            <span className="text-sm font-medium">Active</span>
                        </div>
                        <div className="flex-1 h-1" style={{ backgroundColor: colors.wizard.secondary }} />
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 font-bold border-2"
                                style={{
                                    backgroundColor: colors.wizard.inactive,
                                    borderColor: colors.wizard.secondary
                                }}
                            >
                                2
                            </div>
                            <span className="text-sm text-muted-foreground">Pending</span>
                        </div>
                        <div className="flex-1 h-1" style={{ backgroundColor: colors.wizard.inactive }} />
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 font-bold"
                                style={{ backgroundColor: colors.wizard.inactive }}
                            >
                                3
                            </div>
                            <span className="text-sm text-muted-foreground">Inactive</span>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Toast Notifications Preview */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Notification Styles</h2>
                    <div className="space-y-4">
                        <Alert
                            style={{
                                borderColor: colors.toasts.success.border,
                                backgroundColor: colors.toasts.success.bg,
                                color: colors.toasts.success.text
                            }}
                        >
                            <CheckCircle2 className="h-4 w-4" style={{ color: colors.toasts.success.action }} />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                                Your operation completed successfully!
                            </AlertDescription>
                        </Alert>

                        <Alert
                            style={{
                                borderColor: colors.toasts.info.border,
                                backgroundColor: colors.toasts.info.bg,
                                color: colors.toasts.info.text
                            }}
                        >
                            <Info className="h-4 w-4" style={{ color: colors.toasts.info.action }} />
                            <AlertTitle>Information</AlertTitle>
                            <AlertDescription>
                                Here's some useful information for you.
                            </AlertDescription>
                        </Alert>

                        <Alert
                            style={{
                                borderColor: colors.toasts.warning.border,
                                backgroundColor: colors.toasts.warning.bg,
                                color: colors.toasts.warning.text
                            }}
                        >
                            <AlertTriangle className="h-4 w-4" style={{ color: colors.toasts.warning.action }} />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Please be aware of this important notice.
                            </AlertDescription>
                        </Alert>
                    </div>
                </section>

                <Separator />

                {/* Buttons */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Buttons & Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            style={{
                                background: `linear-gradient(135deg, ${colors.wizard.primary}, ${colors.wizard.secondary})`,
                                color: 'white'
                            }}
                        >
                            Primary Action
                        </Button>
                        <Button variant="outline" style={{ borderColor: colors.wizard.primary, color: colors.wizard.primary }}>
                            Secondary Action
                        </Button>
                        <Button variant="ghost">
                            Tertiary Action
                        </Button>
                        <Button
                            variant="destructive"
                            style={{ backgroundColor: colors.accents.overdue }}
                        >
                            Destructive Action
                        </Button>
                    </div>
                </section>

                {/* Color Palette Reference */}
                <section className="mt-12">
                    <h2 className="text-2xl font-semibold mb-4">Complete Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ColorSwatch label="Restaurant" color={colors.requestTypes.restaurant} />
                        <ColorSwatch label="Event" color={colors.requestTypes.event} />
                        <ColorSwatch label="Cuisine" color={colors.requestTypes.cuisine} />
                        <ColorSwatch label="BDR" color={colors.accents.bdr} />
                        <ColorSwatch label="Deadline" color={colors.accents.deadline} />
                        <ColorSwatch label="Overdue" color={colors.accents.overdue} />
                        <ColorSwatch label="Wizard Primary" color={colors.wizard.primary} />
                        <ColorSwatch label="Wizard Secondary" color={colors.wizard.secondary} />
                    </div>
                </section>
            </div>
        </div>
    );
}

function ColorSwatch({ label, color }: { label: string; color: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div
                className="w-12 h-12 rounded border-2 border-gray-200"
                style={{ backgroundColor: color }}
            />
            <div className="flex-1">
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground font-mono">{color}</div>
            </div>
        </div>
    );
}
