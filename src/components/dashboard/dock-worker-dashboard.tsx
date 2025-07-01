import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, GitBranch, ClipboardCheck } from "lucide-react";

const dockWorkerActions = [
  {
    title: "Pending Shipments",
    icon: <Package className="h-8 w-8 text-primary" />,
    description: "View and process shipments awaiting action at the dock.",
  },
  {
    title: "Handoff Tracking",
    icon: <GitBranch className="h-8 w-8 text-primary" />,
    description: "Display all items that need to be handed off.",
  },
  {
    title: "Log Package Condition",
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    description: "Log package conditions (e.g., Good, Damaged, Lost).",
  },
];

export default function DockWorkerDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
