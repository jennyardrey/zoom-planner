import { useZoom } from "@/components/zoom/zoom-store";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskDialog } from "@/components/TaskDialog";
import { TimeGrid } from "@/components/TimeGrid";
import { useState } from "react";
import { cn } from "@/lib/utils";

const WINDOW_SIZES = [1, 3, 5, 8] as const;
type WindowSize = typeof WINDOW_SIZES[number];

// Fixed pixel height the grid always fills — hours scale to fit
const GRID_HEIGHT = 512;

// How fine-grained the grid lines (and click slots) are per window size
const SUBDIVISION_MINUTES: Record<WindowSize, number> = {
  1: 15,
  3: 30,
  5: 30,
  8: 60,
};

export default function HourView() {
  const { focusDate, focusHour, setFocusHour, setFocusDate } = useZoom();
  const [windowSize, setWindowSize] = useState<WindowSize>(1);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [pendingTime, setPendingTime] = useState("");

  const hour = focusHour ?? new Date().getHours();
  const dateStr = format(focusDate, "yyyy-MM-dd");
  const startHour = hour;
  const endHour = Math.min(24, hour + windowSize);

  const { data: tasks, isLoading } = useTasks(dateStr, dateStr);

  const windowTasks = tasks?.filter(t => {
    if (!t.timeStart || t.allDay) return false;
    const [sh, sm] = t.timeStart.split(":").map(Number);
    const taskStart = sh * 60 + sm;
    const winStart = startHour * 60;
    const winEnd = endHour * 60;
    if (t.timeEnd) {
      const [eh, em] = t.timeEnd.split(":").map(Number);
      return (eh * 60 + em) > winStart && taskStart < winEnd;
    }
    return taskStart >= winStart && taskStart < winEnd;
  }) || [];

  const handleNext = () => {
    if (hour < 23) setFocusHour(hour + 1);
    else { setFocusDate(addDays(focusDate, 1)); setFocusHour(0); }
  };

  const handlePrev = () => {
    if (hour > 0) setFocusHour(hour - 1);
    else { setFocusDate(subDays(focusDate, 1)); setFocusHour(23); }
  };

  const handleSlotClick = (time: string) => {
    setPendingTime(time);
    setSlotDialogOpen(true);
  };

  const handleSlotDialogChange = (open: boolean) => {
    setSlotDialogOpen(open);
    if (!open) setPendingTime("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold">{format(focusDate, "EEEE")}</h2>
          <p className="text-muted-foreground">{format(focusDate, "MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Window size selector */}
      <div className="flex gap-2">
        {WINDOW_SIZES.map(size => (
          <button
            key={size}
            onClick={() => setWindowSize(size)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              windowSize === size
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            {size}h
          </button>
        ))}
      </div>

      {/* Time grid */}
      {isLoading ? (
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : (
        <TimeGrid
          tasks={windowTasks}
          date={dateStr}
          startHour={startHour}
          endHour={endHour}
          totalHeight={GRID_HEIGHT}
          minSubdivisionMinutes={SUBDIVISION_MINUTES[windowSize]}
          onSlotClick={handleSlotClick}
        />
      )}

      {/* Controlled TaskDialog for slot clicks */}
      <TaskDialog
        key={pendingTime}
        defaultDate={dateStr}
        defaultTimeStart={pendingTime || undefined}
        open={slotDialogOpen}
        onOpenChange={handleSlotDialogChange}
      />
    </div>
  );
}
