import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { useCreateTask } from "@/hooks/use-tasks";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

interface TaskDialogProps {
  defaultDate?: string;
}

export function TaskDialog({ defaultDate }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const createTask = useCreateTask();
  
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      date: defaultDate || format(new Date(), "yyyy-MM-dd"),
      status: "todo",
      isPriority: false,
      notes: ""
    }
  });

  const onSubmit = async (data: InsertTask) => {
    try {
      await createTask.mutateAsync(data);
      form.reset();
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="What needs to be done?" autoFocus />
            {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox 
                id="priority" 
                checked={form.watch("isPriority")} 
                onCheckedChange={(c) => form.setValue("isPriority", c === true)} 
              />
              <Label htmlFor="priority" className="cursor-pointer font-normal">High Priority</Label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
