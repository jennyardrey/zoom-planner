import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "./ui/drawer";

export default function DayDetailDrawer({ date, open }: { date: Date | null, open: boolean, }) {
    return (
        <Drawer open={open} >
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle><p>Tasks for {date?.toDateString()}</p></DrawerTitle>
                    </DrawerHeader>
                </div>
            </DrawerContent>
        </Drawer>
    )
};
