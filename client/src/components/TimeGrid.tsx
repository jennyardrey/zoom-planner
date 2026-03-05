import { Task } from "@shared/schema";
import { TaskCard } from "@/components/TaskCard";

interface TimeGridProps {
  tasks: Task[];
  date: string;
  onSlotClick: (time: string) => void;
  startHour?: number;             // override auto-fit
  endHour?: number;               // override auto-fit
  totalHeight?: number;           // px — grid fills this height (overrides HOUR_HEIGHT)
  minSubdivisionMinutes?: number; // 60 | 30 | 15  (default 30)
}

const DEFAULT_HOUR_HEIGHT = 64; // px per hour (used when totalHeight not provided)

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export function TimeGrid({
  tasks,
  date,
  onSlotClick,
  startHour: startHourProp,
  endHour: endHourProp,
  totalHeight,
  minSubdivisionMinutes = 30,
}: TimeGridProps) {
  const timedTasks = tasks.filter(t => t.timeStart && !t.allDay);

  let startHour: number;
  let endHour: number;

  if (startHourProp !== undefined && endHourProp !== undefined) {
    startHour = startHourProp;
    endHour = endHourProp;
  } else if (timedTasks.length === 0) {
    startHour = 8;
    endHour = 20;
  } else {
    const startMinutes = timedTasks.map(t => {
      const [h, m] = t.timeStart!.split(":").map(Number);
      return h * 60 + m;
    });
    const endMinutes = timedTasks.map(t => {
      if (t.timeEnd) {
        const [h, m] = t.timeEnd.split(":").map(Number);
        return h * 60 + m;
      }
      const [h, m] = t.timeStart!.split(":").map(Number);
      return h * 60 + m + 60;
    });
    startHour = Math.max(0, Math.floor(Math.min(...startMinutes) / 60) - 1);
    endHour = Math.min(24, Math.ceil(Math.max(...endMinutes) / 60) + 1);
  }

  const numHours = endHour - startHour;
  const hours = Array.from({ length: numHours }, (_, i) => startHour + i);
  const hourHeight = totalHeight !== undefined ? totalHeight / numHours : DEFAULT_HOUR_HEIGHT;
  const gridHeight = numHours * hourHeight;

  // Clickable slots based on minSubdivisionMinutes (clamped to 30 min minimum for clicking)
  const slotMinutes = Math.min(minSubdivisionMinutes, 30);
  const slotsPerHour = 60 / slotMinutes;

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-14 shrink-0" />
        <div className="flex-1 border-l border-border" />
      </div>

      <div className="flex">
        {/* Time labels */}
        <div className="w-14 shrink-0 relative" style={{ height: gridHeight }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute right-2 text-xs text-muted-foreground"
              style={{ top: (hour - startHour) * hourHeight - 8 }}
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* Grid area */}
        <div className="flex-1 border-l border-border relative" style={{ height: gridHeight }}>
          {/* Hour + subdivision lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-border"
              style={{ top: (hour - startHour) * hourHeight }}
            >
              {/* :30 mark */}
              {minSubdivisionMinutes <= 30 && (
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-border/50"
                  style={{ top: hourHeight / 2 }}
                />
              )}
              {/* :15 and :45 marks */}
              {minSubdivisionMinutes <= 15 && (
                <>
                  <div
                    className="absolute left-0 right-0 border-t border-dotted border-border/30"
                    style={{ top: hourHeight / 4 }}
                  />
                  <div
                    className="absolute left-0 right-0 border-t border-dotted border-border/30"
                    style={{ top: hourHeight * 3 / 4 }}
                  />
                </>
              )}
            </div>
          ))}

          {/* Clickable slots */}
          {hours.flatMap((hour) =>
            Array.from({ length: slotsPerHour }, (_, i) => {
              const minutes = i * slotMinutes;
              const top = (hour - startHour) * hourHeight + (minutes / 60) * hourHeight;
              const slotHeight = hourHeight / slotsPerHour;
              const timeStr = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
              return (
                <div
                  key={`${hour}-${minutes}`}
                  className="absolute left-0 right-0 hover:bg-primary/5 cursor-pointer transition-colors"
                  style={{ top, height: slotHeight }}
                  onClick={() => onSlotClick(timeStr)}
                />
              );
            })
          )}

          {/* Tasks */}
          {timedTasks.map((task) => {
            const [startH, startM] = task.timeStart!.split(":").map(Number);
            const top = (startH * 60 + startM - startHour * 60) * (hourHeight / 60);

            let height = hourHeight;
            if (task.timeEnd) {
              const [endH, endM] = task.timeEnd.split(":").map(Number);
              height = Math.max(28, ((endH * 60 + endM) - (startH * 60 + startM)) * (hourHeight / 60));
            }

            return (
              <div
                key={task.id}
                className="absolute left-1 right-1 z-10 overflow-hidden"
                style={{ top, height }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full">
                  <TaskCard task={task} compact />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
