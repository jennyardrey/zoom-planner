import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "./ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";

export default function DayDetailDrawer({ date, open, onOpenChange, tasks = [] }: { date: Date | null, open: boolean, onOpenChange: (open: boolean) => void, tasks?: Task[] }) {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (

            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent style={{ height: "50vh" }}>
                    <div className="mx-auto w-full max-w-sm h-full overflow-auto relative">
                        <DrawerHeader>
                            <DrawerTitle>Tasks for {date?.toDateString()}</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 gap-4 flex flex-col  h-9/10">
                            {tasks.map(task => (
                                <div key={task.id}>
                                    <p>{task.title}</p>
                                </div>
                            ))}
                            <button className="text-sm text-muted-foreground w-fit absolute bottom-0 mb-16" onClick={() => { location.href = `/day/${date?.toDateString()}` }}>Go To Day</button>
                        </div>
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