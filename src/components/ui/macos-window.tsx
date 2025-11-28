"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { useState, useRef } from "react";

interface MacOSWindowProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    draggable?: boolean;
    initialPosition?: { x: number; y: number };
}

export function MacOSWindow({
    title = "Window",
    children,
    className,
    onClose,
    onMinimize,
    onMaximize,
    draggable = true,
    initialPosition = { x: 100, y: 100 },
}: MacOSWindowProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const constraintsRef = useRef(null);

    const handleMaximize = () => {
        setIsMaximized(!isMaximized);
        onMaximize?.();
    };

    return (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none">
            <motion.div
                drag={draggable && !isMaximized}
                dragConstraints={constraintsRef}
                dragElastic={0}
                dragMomentum={false}
                initial={initialPosition}
                animate={
                    isMaximized
                        ? { x: 0, y: 0, width: "100%", height: "100%" }
                        : undefined
                }
                className={cn(
                    "pointer-events-auto absolute",
                    "macos-blur macos-shadow-lg",
                    "bg-background/70 dark:bg-background/70",
                    "rounded-xl overflow-hidden",
                    "border border-border/50",
                    !isMaximized && "w-[600px] h-[400px]",
                    className
                )}
            >
                {/* Title Bar */}
                <div
                    className={cn(
                        "flex items-center justify-between px-4 py-3",
                        "border-b border-border/50",
                        "bg-background/30",
                        draggable && !isMaximized && "cursor-move"
                    )}
                >
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group relative"
                            aria-label="Close"
                        >
                            <X className="w-2 h-2 absolute inset-0 m-auto text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                            onClick={onMinimize}
                            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors group relative"
                            aria-label="Minimize"
                        >
                            <Minus className="w-2 h-2 absolute inset-0 m-auto text-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                            onClick={handleMaximize}
                            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors group relative"
                            aria-label="Maximize"
                        >
                            <Maximize2 className="w-2 h-2 absolute inset-0 m-auto text-green-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Title */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium text-foreground/70">
                        {title}
                    </div>

                    {/* Spacer for symmetry */}
                    <div className="w-[60px]" />
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto h-[calc(100%-57px)]">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
