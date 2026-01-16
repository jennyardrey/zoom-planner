import { useGoals, useCreateGoal, useDeleteGoal } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, type InsertGoal } from "@shared/schema";
import { Plus, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const { data: goals } = useGoals();
  const deleteGoal = useDeleteGoal();
  const [open, setOpen] = useState(false);
  const createGoal = useCreateGoal();

  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      title: "",
      timeframe: "year",
      status: "active"
    }
  });

  const onSubmit = (data: InsertGoal) => {
    createGoal.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  const sections = [
    { label: "Yearly Goals", value: "year", color: "text-purple-600 bg-purple-50" },
    { label: "Monthly Goals", value: "month", color: "text-blue-600 bg-blue-50" },
    { label: "Weekly Goals", value: "week", color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-transition">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold">Goals & Visions</h2>
          <p className="text-muted-foreground">Define your long-term success.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <h3 className="text-lg font-bold mb-4">Set a New Goal</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input {...form.register("title")} placeholder="e.g. Read 24 Books" />
              </div>
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select onValueChange={v => form.setValue("timeframe", v as any)} defaultValue="year">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createGoal.isPending}>Create Goal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map(section => {
          const sectionGoals = goals?.filter(g => g.timeframe === section.value) || [];
          
          return (
            <div key={section.value} className="space-y-4">
              <div className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", section.color)}>
                {section.label}
              </div>
              
              <div className="space-y-3">
                {sectionGoals.map(goal => (
                  <Card key={goal.id} className="group hover:border-primary/50 transition-all">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Target className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{goal.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{goal.status}</p>
                      </div>
                      <button 
                        onClick={() => deleteGoal.mutate(goal.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {sectionGoals.length === 0 && (
                  <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                    No {section.value} goals yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
