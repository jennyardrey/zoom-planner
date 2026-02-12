import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "./ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";

export default function DayDetailDrawer({ date, open, onOpenChange, tasks = [] }: { date: Date | null, open: boolean, onOpenChange: (open: boolean) => void, tasks?: Task[] }) {
    console.log('tasks: ', tasks)
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle><p>Tasks for {date?.toDateString()}</p></DrawerTitle>
                        </DrawerHeader>
                        <DrawerDescription>
                            {tasks.map(task => (
                                <div key={task.id}>
                                    <p>{task.title}</p>
                                </div>
                            ))}
                            <button onClick={(date) => { location.href = `/day/${date?.toDateString()}` }}>Go To Day</button>
                        </DrawerDescription>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>Some description for the Sheet</SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
};