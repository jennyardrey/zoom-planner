import { useHabits, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const { data: habits } = useHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const [newHabit, setNewHabit] = useState("");

  const handleAdd = () => {
    if (!newHabit.trim()) return;
    createHabit.mutate({ 
      name: newHabit, 
      isActive: true, 
      schedule: "daily" 
    });
    setNewHabit("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 page-transition">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold">Habit Tracker</h2>
        <p className="text-muted-foreground">Small actions, compounding results.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter a new habit (e.g. Meditate 10m)" 
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!newHabit.trim() || createHabit.isPending}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {habits?.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 text-accent rounded-full">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{habit.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded capitalize">{habit.schedule}</span>
                  <button 
                    onClick={() => deleteHabit.mutate(habit.id)}
                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {habits?.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No habits being tracked.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
