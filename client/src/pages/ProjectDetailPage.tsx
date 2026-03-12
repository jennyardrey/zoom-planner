import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useProjects } from "@/hooks/use-projects";
import { useProjectSections, useCreateSection, useUpdateSection, useDeleteSection } from "@/hooks/use-sections";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, GripVertical, Trash2, Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Task } from "@shared/schema";
import * as SectionService from "@/services/sections";
import * as TaskService from "@/services/tasks";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useProjects();
  const { data: sections = [], isLoading: sectionsLoading } = useProjectSections(projectId);
  const { data: allTasks = [] } = useTasks();
  const createSection = useCreateSection();
  const deleteSection = useDeleteSection();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [newSectionName, setNewSectionName] = useState("");
  const [addingSectionInput, setAddingSectionInput] = useState(false);
  const [addingTaskInSection, setAddingTaskInSection] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const project = projects.find(p => p.id === projectId);

  // Get tasks for this project, grouped by sectionId
  const projectTasks = allTasks.filter(t => t.projectId === projectId);
  const unsectionedTasks = projectTasks.filter(t => !t.sectionId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const getTasksForSection = (sectionId: string) =>
    projectTasks.filter(t => t.sectionId === sectionId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;
    await createSection.mutateAsync({
      projectId: projectId!,
      section: { name: newSectionName.trim(), order: sections.length },
    });
    setNewSectionName("");
    setAddingSectionInput(false);
  };

  const handleAddTask = async (sectionId?: string) => {
    if (!newTaskTitle.trim()) return;
    const sectionTasks = sectionId ? getTasksForSection(sectionId) : unsectionedTasks;
    await createTask.mutateAsync({
      title: newTaskTitle.trim(),
      date: format(new Date(), "yyyy-MM-dd"),
      allDay: true,
      timeStart: null,
      timeEnd: null,
      status: "todo",
      isPriority: false,
      projectId: projectId,
      sectionId: sectionId,
      order: sectionTasks.length,
    });
    setNewTaskTitle("");
    setAddingTaskInSection(null);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "SECTION") {
      // Reorder sections
      const reordered = Array.from(sections);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      // Optimistically update cache
      queryClient.setQueryData(["sections", user?.uid, projectId], reordered);
      // Persist new order
      await Promise.all(
        reordered.map((s, i) =>
          SectionService.updateSection(user!.uid, projectId!, s.id, { order: i })
        )
      );
    } else if (type === "TASK") {
      const sourceSectionId = source.droppableId === "unsectioned" ? undefined : source.droppableId;
      const destSectionId = destination.droppableId === "unsectioned" ? undefined : destination.droppableId;

      const sourceTasks = sourceSectionId
        ? getTasksForSection(sourceSectionId)
        : unsectionedTasks;
      const destTasks =
        source.droppableId === destination.droppableId
          ? sourceTasks
          : destSectionId
          ? getTasksForSection(destSectionId)
          : unsectionedTasks;

      const newSourceTasks = Array.from(sourceTasks);
      const [movedTask] = newSourceTasks.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        newSourceTasks.splice(destination.index, 0, movedTask);
        // Optimistically update cache
        const newAllTasks = allTasks.map(t => {
          const found = newSourceTasks.find(st => st.id === t.id);
          if (found) return { ...t, order: newSourceTasks.indexOf(found) };
          return t;
        });
        queryClient.setQueryData(["tasks", user?.uid, undefined, undefined], newAllTasks);
        await Promise.all(
          newSourceTasks.map((t, i) =>
            TaskService.updateTask(user!.uid, t.id, { order: i })
          )
        );
      } else {
        const newDestTasks = Array.from(destTasks);
        newDestTasks.splice(destination.index, 0, { ...movedTask, sectionId: destSectionId, order: destination.index });
        // Persist
        await TaskService.updateTask(user!.uid, movedTask.id, {
          sectionId: destSectionId,
          order: destination.index,
        });
        await Promise.all(
          newDestTasks.map((t, i) =>
            t.id !== movedTask.id ? TaskService.updateTask(user!.uid, t.id, { order: i }) : Promise.resolve()
          )
        );
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    }
  };

  if (!project && !sectionsLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mt-4">Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project?.color || "#3b82f6" }}
          />
          <h1 className="text-2xl font-bold">{project?.name}</h1>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Unsectioned tasks */}
        <div className="space-y-2">
          <Droppable droppableId="unsectioned" type="TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn("space-y-2 min-h-[4px] rounded-lg transition-colors", snapshot.isDraggingOver && "bg-primary/5")}
              >
                {unsectionedTasks.map((task, index) => (
                  <DraggableTaskRow
                    key={task.id}
                    task={task}
                    index={index}
                    onDelete={() => deleteTask.mutate(task.id)}
                    onToggle={() => updateTask.mutate({ id: task.id, updates: { status: task.status === "done" ? "todo" : "done" } })}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add task to unsectioned */}
          {addingTaskInSection === "unsectioned" ? (
            <InlineTaskInput
              value={newTaskTitle}
              onChange={setNewTaskTitle}
              onSubmit={() => handleAddTask(undefined)}
              onCancel={() => { setAddingTaskInSection(null); setNewTaskTitle(""); }}
            />
          ) : (
            <button
              onClick={() => { setAddingTaskInSection("unsectioned"); setNewTaskTitle(""); }}
              className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground px-1 py-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add task
            </button>
          )}
        </div>

        {/* Sections */}
        <Droppable droppableId="sections-list" type="SECTION">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {sections.map((section, sectionIndex) => {
                const sectionTasks = getTasksForSection(section.id);
                return (
                  <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn("space-y-2", snapshot.isDragging && "opacity-80")}
                      >
                        {/* Section header */}
                        <div className="flex items-center gap-2 group">
                          <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider flex-1">{section.name}</h3>
                          <button
                            onClick={() => {
                              if (confirm(`Delete section "${section.name}"?`)) {
                                deleteSection.mutate({ projectId: projectId!, sectionId: section.id });
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Section tasks */}
                        <Droppable droppableId={section.id} type="TASK">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn("space-y-2 min-h-[4px] rounded-lg transition-colors pl-6", snapshot.isDraggingOver && "bg-primary/5")}
                            >
                              {sectionTasks.map((task, taskIndex) => (
                                <DraggableTaskRow
                                  key={task.id}
                                  task={task}
                                  index={taskIndex}
                                  onDelete={() => deleteTask.mutate(task.id)}
                                  onToggle={() => updateTask.mutate({ id: task.id, updates: { status: task.status === "done" ? "todo" : "done" } })}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Add task in section */}
                        <div className="pl-6">
                          {addingTaskInSection === section.id ? (
                            <InlineTaskInput
                              value={newTaskTitle}
                              onChange={setNewTaskTitle}
                              onSubmit={() => handleAddTask(section.id)}
                              onCancel={() => { setAddingTaskInSection(null); setNewTaskTitle(""); }}
                            />
                          ) : (
                            <button
                              onClick={() => { setAddingTaskInSection(section.id); setNewTaskTitle(""); }}
                              className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground px-1 py-1 transition-colors"
                            >
                              <Plus className="w-4 h-4" /> Add task
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add section */}
      <div className="pt-2 border-t border-border/40">
        {addingSectionInput ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") { setAddingSectionInput(false); setNewSectionName(""); } }}
              placeholder="Section name..."
              className="max-w-xs"
            />
            <Button size="sm" onClick={handleAddSection} disabled={createSection.isPending}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingSectionInput(false); setNewSectionName(""); }}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAddingSectionInput(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Section
          </Button>
        )}
      </div>
    </div>
  );
}

// Sub-components

function DraggableTaskRow({ task, index, onToggle, onDelete }: { task: Task; index: number; onToggle: () => void; onDelete: () => void }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group flex items-center gap-2 p-2.5 rounded-lg border transition-all",
            snapshot.isDragging ? "shadow-lg border-primary/30 bg-card" : task.status === "done" ? "bg-muted/20 border-transparent opacity-50" : "bg-card border-border hover:border-primary/20"
          )}
        >
          <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={onToggle}
            className="rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium truncate", task.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>
              {task.title}
            </p>
            {task.date && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.date + "T00:00:00"), "d MMM")}
                {task.timeStart && ` · ${task.timeStart}`}
              </p>
            )}
          </div>
          {task.isPriority && task.status !== "done" && (
            <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
          )}
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Draggable>
  );
}

function InlineTaskInput({ value, onChange, onSubmit, onCancel }: { value: string; onChange: (v: string) => void; onSubmit: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <Input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onCancel(); }}
        placeholder="Task name..."
        className="text-sm"
      />
      <Button size="sm" onClick={onSubmit}>Add</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  );
}
