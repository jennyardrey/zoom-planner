import { Task } from "@shared/schema";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Trash2, Star } from "lucide-react";

export function TaskCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleToggle = () => {
    updateTask.mutate({ 
      id: task.id, 
      updates: { status: task.status === "done" ? "todo" : "done" } 
    });
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
      task.status === "done" 
        ? "bg-muted/30 border-transparent opacity-60" 
        : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
    )}>
      <Checkbox 
        checked={task.status === "done"} 
        onCheckedChange={handleToggle}
        className="rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate transition-colors",
          task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {task.title}
        </p>
      </div>

      {task.isPriority && task.status !== "done" && (
        <Star className="w-4 h-4 text-accent fill-accent shrink-0" />
      )}

      <button 
        onClick={() => deleteTask.mutate(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
