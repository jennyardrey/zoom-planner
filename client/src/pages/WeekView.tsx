import { useTasks } from "@/hooks/use-tasks";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, addWeeks, subWeeks } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WeekView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const { data: tasks, isLoading } = useTasks(
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  );

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  if (isLoading) return <div className="p-8">Loading week...</div>;

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Weekly Overview</h2>
          <p className="text-muted-foreground">{format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          <div className="ml-2">
            <TaskDialog defaultDate={format(new Date(), "yyyy-MM-dd")} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-0 lg:divide-x border rounded-xl bg-card shadow-sm overflow-hidden">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasks?.filter(t => t.date === dateKey) || [];
          const isCurrentDay = isToday(day);

          return (
            <div key={dateKey} className={cn("min-h-[200px] lg:min-h-[600px] p-3 flex flex-col gap-2", isCurrentDay && "bg-primary/5")}>
              <div className="text-center mb-2 pb-2 border-b border-border/50">
                <p className="text-xs uppercase font-bold text-muted-foreground">{format(day, "EEE")}</p>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-medium",
                  isCurrentDay ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, "d")}
                </div>
              </div>
              
              <div className="space-y-2 flex-1">
                {dayTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {dayTasks.length === 0 && (
                  <button className="w-full text-left text-xs text-muted-foreground/50 p-2 hover:bg-secondary/50 rounded transition-colors">
                    + Click to add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
