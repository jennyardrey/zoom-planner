import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@shared/schema";
import { useZoom } from "@/components/zoom/zoom-store";

export default function MonthView() {
  const { focusDate, setFocusDate } = useZoom();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const currentDate = focusDate;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: tasks } = useTasks(
    format(calendarStart, "yyyy-MM-dd"),
    format(calendarEnd, "yyyy-MM-dd")
  );

  const getTaskIntesity = (tasks: Task[]) => {
    const taskCount = tasks.length;
    if (taskCount === 0) return "";
    if (taskCount <= 3) return "bg-green-500/20";
    if (taskCount <= 6) return "bg-yellow-500/20";
    return "bg-red-500/20";
  }

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setFocusDate(addMonths(currentDate, 1));
  const prevMonth = () => setFocusDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6 page-transition h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={() => setFocusDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border flex-1 min-h-[600px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-card p-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasks?.filter(t => t.date === dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          console.log("tasks: ", tasks)

          return (
            <div key={dateKey} className={cn("bg-card p-2 min-h-[100px] flex flex-col gap-1", !isCurrentMonth && "bg-secondary/30 text-muted-foreground", getTaskIntesity(dayTasks))}>
              <div className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ml-auto",
                isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className={cn(
                    "text-[10px] truncate px-1.5 py-0.5 rounded border border-transparent",
                    task.status === "done" ? "line-through text-muted-foreground bg-secondary" : "bg-primary/5 text-primary border-primary/10"
                  )}>
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">+ {dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
