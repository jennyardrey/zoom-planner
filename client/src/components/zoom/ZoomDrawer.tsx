import { useZoom } from "./zoom-store";
import { ZOOM_LEVELS, ZoomLevel } from "./zoom-types";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

export function ZoomDrawer() {
    const { zoomLevel, setZoomLevel, isDrawerOpen, closeDrawer } = useZoom();

    // 1. Scroll Locking
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpen]);

    // 2. Local State for UI Stability (prevent flickering)
    // We track the 'visual' active index locally while dragging
    const [localIndex, setLocalIndex] = useState(ZOOM_LEVELS.indexOf(zoomLevel));

    // Sync local index when global state changes externally (and not dragging)
    useEffect(() => {
        setLocalIndex(ZOOM_LEVELS.indexOf(zoomLevel));
    }, [zoomLevel]);

    // 3. Framer Motion Drag Setup
    const constraintsRef = useRef<HTMLDivElement>(null);
    const TRACK_HEIGHT = 300;
    const STEPS = ZOOM_LEVELS.length;
    const STEP_HEIGHT = TRACK_HEIGHT / (STEPS - 1);

    // Initial Y position based on current level
    const y = useMotionValue(0);

    // Update Y when opening or state changing
    useEffect(() => {
        const targetidx = ZOOM_LEVELS.indexOf(zoomLevel);
        // Map index to Y position (0 = top/first, etc)
        // We want 0 -> 0, 4 -> 300. 
        animate(y, targetidx * STEP_HEIGHT);
    }, [zoomLevel, STEP_HEIGHT, y]);

    const handleDrag = (event: any, info: any) => {
        // Update local visual feedback
        const currentY = y.get();
        // Clamp and find nearest index
        const rawIndex = Math.round(currentY / STEP_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(rawIndex, STEPS - 1));

        if (clampedIndex !== localIndex) {
            setLocalIndex(clampedIndex);
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        // Commit change
        const currentY = y.get();
        const finalIndex = Math.max(0, Math.min(Math.round(currentY / STEP_HEIGHT), STEPS - 1));

        // Snap animation visually
        animate(y, finalIndex * STEP_HEIGHT);

        // Update Global State
        setZoomLevel(ZOOM_LEVELS[finalIndex]);
    };

    const handleTapStep = (index: number) => {
        setLocalIndex(index);
        setZoomLevel(ZOOM_LEVELS[index]);
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-32 bg-card border-r border-border z-[70] flex flex-col items-center py-8 shadow-2xl"
                    >
                        <button
                            onClick={closeDrawer}
                            className="mb-8 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex-1 relative flex flex-col items-center justify-center w-full select-none touch-none">
                            {/* Track Line */}
                            <div className="absolute h-[300px] w-1 bg-border rounded-full" />

                            {/* Slider Container / Constraints */}
                            <div
                                ref={constraintsRef}
                                className="relative h-[300px] w-full flex justify-center"
                            >
                                {/* Steps (Visual Only) */}
                                <div className="absolute inset-0 flex flex-col justify-between items-center pointer-events-none">
                                    {ZOOM_LEVELS.map((level, index) => {
                                        const isSelected = index === localIndex;
                                        return (
                                            <div
                                                key={level}
                                                className="relative w-full flex justify-center items-center h-4"
                                            >
                                                {/* Dot Marker */}
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-full transition-colors duration-300 z-10",
                                                        isSelected ? "bg-primary/50" : "bg-muted-foreground/30"
                                                    )}
                                                />
                                                {/* Label (Right) */}
                                                <span className={cn(
                                                    "absolute left-[60%] text-sm font-medium transition-all duration-300 capitalize",
                                                    isSelected ? "text-primary scale-110" : "text-muted-foreground/60"
                                                )}>
                                                    {level}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Click Targets (Invisible but clickable) */}
                                <div className="absolute inset-0 flex flex-col justify-between items-center z-10">
                                    {ZOOM_LEVELS.map((level, index) => (
                                        <div
                                            key={`target-${index}`}
                                            className="w-full h-10 flex items-center justify-center cursor-pointer"
                                            onClick={() => handleTapStep(index)}
                                        />
                                    ))}
                                </div>

                                {/* Draggable Knob */}
                                <motion.div
                                    drag="y"
                                    dragConstraints={constraintsRef}
                                    dragElastic={0}
                                    dragMomentum={false}
                                    onDrag={handleDrag}
                                    onDragEnd={handleDragEnd}
                                    style={{ y }}
                                    className="absolute top-0 w-8 h-8 -ml-4 left-1/2 -ml-4 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center -mt-2"
                                // -mt-2 roughly centers the 32px knob on the dot if heights align. 
                                // Actually top-0 aligns with first item? 
                                // Flex 'justify-between' puts first item at very top edge?
                                // If container is 300px, top is 0. 
                                >
                                    <div className="w-6 h-6 bg-primary rounded-full shadow-lg border-2 border-background ring-2 ring-primary/20" />
                                </motion.div>
                            </div>
                        </div>

                        <div className="mt-8 text-xs text-muted-foreground font-medium uppercase tracking-widest text-center">
                            Zoom Level
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
