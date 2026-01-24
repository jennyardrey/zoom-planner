import { useZoom } from "@/components/zoom/zoom-store";
import { format, addHours, subHours } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getUserTasks, createTask } from "@/services/tasks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InsertTask } from "@shared/schema";

export default function HourView() {
    const { focusDate, focusHour, setFocusHour, setFocusDate, direction } = useZoom();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const hour = focusHour ?? 9; // Default to 9am if null (shouldn't happen in this view)
    const dateStr = format(focusDate, 'yyyy-MM-dd');
    const displayTime = `${String(hour).padStart(2, '0')}:00`;
    const nextTime = `${String(hour + 1).padStart(2, '0')}:00`;

    const { data: tasks, isLoading } = useQuery({
        queryKey: [dateStr, "tasks"], // We fetch all tasks for the day and filter client side for now as per service structure
        queryFn: () => getUserTasks(user?.uid!, dateStr, dateStr),
        enabled: !!user,
    });

    const hourTasks = tasks?.filter(t => {
        if (!t.timeStart) return false;
        const taskHour = parseInt(t.timeStart.split(':')[0]);
        return taskHour === hour;
    }) || [];

    const createMutation = useMutation({
        mutationFn: (task: InsertTask) => createTask(user?.uid!, task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [dateStr, "tasks"] });
            setNewTaskTitle("");
        },
    });

    const handleNext = () => {
        if (hour === 23) {
            setFocusDate(addHours(focusDate, 24)); // Go to next day? Or just wrap hour? Let's just wrap hour within day for now or maybe not.
            // Actually simpler to just change hour, but if 23->0 need to change day.
            // Let's keep it simple: strict hour increment
            const next = addHours(new Date(focusDate.setHours(hour)), 1);
            setFocusDate(next);
            setFocusHour(next.getHours());
        } else {
            setFocusHour(hour + 1);
        }
    };

    const handlePrev = () => {
        if (hour === 0) {
            const prev = subHours(new Date(focusDate.setHours(hour)), 1);
            setFocusDate(prev);
            setFocusHour(prev.getHours());
        } else {
            setFocusHour(hour - 1);
        }
    };

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        createMutation.mutate({
            title: newTaskTitle,
            date: dateStr,
            status: "todo",
            timeStart: `${String(hour).padStart(2, '0')}:00`,
            isPriority: false,
        });
    };

    const variants = {
        enter: (direction: string) => ({
            x: direction === 'in' ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: string) => ({
            x: direction === 'in' ? -100 : 100,
            opacity: 0
        })
    };

    return (
        <motion.div
            key={hour} // Animate when hour changes
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold text-foreground">
                    {displayTime} <span className="text-muted-foreground text-xl font-normal">- {nextTime}</span>
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                {format(focusDate, 'EEEE, MMMM do, yyyy')}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-4">
                        {hourTasks.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No tasks scheduled for this hour.</p>
                                <p className="text-xs">Take a break or add a task below.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {hourTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        )}

                        <div className="pt-4 border-t border-border/50">
                            <form onSubmit={handleQuickAdd} className="flex gap-2">
                                <Input
                                    placeholder="Add task for this hour..."
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={createMutation.isPending}>Add</Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
