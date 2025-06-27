import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, LineChart, AlertTriangle } from "lucide-react";

const managerActions = [
  {
    title: "Inventory Overview",
    icon: <LayoutGrid className="h-8 w-8 text-primary" />,
    description: "Monitor stock levels and manage inventory in real-time.",
  },
  {
    title: "Shipment Progress",
    icon: <LineChart className="h-8 w-8 text-primary" />,
    description: "Shows the status of shipments in transit or pending.",
  },
  {
    title: "Low Stock Alerts",
    icon: <AlertTriangle className="h-8 w-8 text-primary" />,
    description: "Notifications for low stock or missing packages.",
  },
];

export default function WarehouseManagerDashboard() {
  return (
    <div className="space-y-4">
      {managerActions.map((action) => (
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
