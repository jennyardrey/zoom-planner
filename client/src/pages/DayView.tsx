import { useTasks } from "@/hooks/use-tasks";
import { useHabitLogs, useHabits, useToggleHabit } from "@/hooks/use-habits";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { TimeGrid } from "@/components/TimeGrid";
import { format, addDays, subDays, isToday } from "date-fns";
import { useState, useRef, useEffect } from "react";

const HOUR_HEIGHT = 64; // must match TimeGrid's DEFAULT_HOUR_HEIGHT
const SCROLL_VIEWPORT_HOURS = 8;
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { useZoom } from "@/components/zoom/zoom-store";

export default function DayView() {
  const { focusDate, setFocusDate } = useZoom();
  const date = focusDate;
  const dateKey = format(date, "yyyy-MM-dd");

  const { data: tasks, isLoading: loadingTasks } = useTasks(dateKey, dateKey);
  const { data: habits } = useHabits();
  const { data: logs } = useHabitLogs(dateKey, dateKey);
  const toggleHabit = useToggleHabit();

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [pendingTime, setPendingTime] = useState("");

  const handleSlotClick = (time: string) => {
    setPendingTime(time);
    setSlotDialogOpen(true);
  };

  const handleSlotDialogChange = (open: boolean) => {
    setSlotDialogOpen(open);
    if (!open) setPendingTime("");
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const anchor = isToday(date) ? new Date().getHours() : 8;
    scrollRef.current.scrollTop = Math.max(0, (anchor - 1) * HOUR_HEIGHT);
  }, [dateKey]);

  const activeHabits = habits?.filter(h => h.isActive) || [];
  const timedTasks = tasks?.filter(t => t.timeStart && !t.allDay) || [];
  const untimedTasks = tasks?.filter(t => !t.timeStart || t.allDay) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setFocusDate(subDays(date, 1))}><ChevronLeft className="w-5 h-5" /></Button>
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold">{isToday(date) ? "Today" : format(date, "EEEE")}</h2>
            <p className="text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFocusDate(addDays(date, 1))}><ChevronRight className="w-5 h-5" /></Button>
        </div>
        <TaskDialog defaultDate={dateKey} />
      </div>

      {/* Unscheduled tasks */}
      {untimedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-muted-foreground uppercase tracking-wide text-xs">Unscheduled</h3>
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
            {untimedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Time Grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-muted-foreground uppercase tracking-wide text-xs">Schedule</h3>
          {loadingTasks ? (
            <div className="bg-card rounded-xl border shadow-sm p-4">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="overflow-y-auto rounded-xl"
              style={{ height: SCROLL_VIEWPORT_HOURS * HOUR_HEIGHT }}
            >
              <TimeGrid
                tasks={timedTasks}
                date={dateKey}
                startHour={0}
                endHour={24}
                onSlotClick={handleSlotClick}
              />
            </div>
          )}
        </div>

        {/* Habits Sidebar */}
        <div className="space-y-4">
          <h3 className="text-muted-foreground uppercase tracking-wide text-xs">Daily Habits</h3>
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
            {activeHabits.length === 0 && <p className="text-sm text-muted-foreground">No habits yet.</p>}
            {activeHabits.map(habit => {
              const isCompleted = logs?.some(l => l.habitId === habit.id && l.completed);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit.mutate({ habitId: habit.id, date: dateKey, completed: !isCompleted })}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/30 hover:bg-secondary border-transparent"
                  )}
                >
                  <span className="font-medium text-sm">{habit.name}</span>
                  {isCompleted && <Check className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controlled TaskDialog for slot clicks */}
      <TaskDialog
        key={pendingTime}
        defaultDate={dateKey}
        defaultTimeStart={pendingTime || undefined}
        open={slotDialogOpen}
        onOpenChange={handleSlotDialogChange}
      />
    </div>
  );
}
