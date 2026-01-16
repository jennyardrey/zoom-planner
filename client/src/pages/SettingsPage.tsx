import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCreateHabit } from "@/hooks/use-habits";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const createHabit = useCreateHabit();

  const addStarterHabits = () => {
    ["Drink 2L Water", "Read 10 Pages", "Exercise 30m"].forEach(h => {
      createHabit.mutate({ name: h, isActive: true, schedule: "daily" });
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 page-transition">
      <h2 className="text-3xl font-serif font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your session and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div>
              <p className="font-medium">Logged in as</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Setup</CardTitle>
          <CardDescription>Tools to help you get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={addStarterHabits} className="w-full sm:w-auto">
            Add Starter Habits Bundle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
