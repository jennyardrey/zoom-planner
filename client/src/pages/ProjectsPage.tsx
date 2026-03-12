import { useState } from "react";
import { useLocation } from "wouter";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectDialog } from "@/components/ProjectDialog";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: projects = [], isLoading } = useProjects();
  const { data: tasks = [] } = useTasks();
  const deleteProject = useDeleteProject();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Organise tasks into projects and sections</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-16 text-center gap-3">
          <Folder className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">No projects yet. Create one to get started.</p>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const count = tasks.filter(t => t.projectId === project.id && t.status !== "done").length;
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: project.color || "#3b82f6" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {count} task{count !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${project.name}"? Tasks will be unassigned.`)) {
                      deleteProject.mutate(project.id);
                    }
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
