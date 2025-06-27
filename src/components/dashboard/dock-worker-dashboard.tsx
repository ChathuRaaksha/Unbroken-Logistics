import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine, ScanLine, Warehouse } from "lucide-react";

const dockWorkerActions = [
  {
    title: "Incoming Shipments",
    icon: <ArrowDownToLine className="h-8 w-8 text-primary" />,
    description: "View and process all incoming shipments for today.",
  },
  {
    title: "Scan Packages",
    icon: <ScanLine className="h-8 w-8 text-primary" />,
    description: "Scan barcodes to update package status in the system.",
  },
  {
    title: "Load/Unload Truck",
    icon: <Warehouse className="h-8 w-8 text-primary" />,
    description: "Manage loading and unloading tasks for scheduled trucks.",
  },
];

export default function DockWorkerDashboard() {
  return (
    <div className="space-y-4">
      {dockWorkerActions.map((action) => (
        <Card key={action.title} className="hover:shadow-md transition-shadow duration-300 hover:bg-primary/5 cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            {action.icon}
            <CardTitle className="font-headline text-lg">{action.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
