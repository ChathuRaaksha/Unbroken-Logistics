import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Truck, PackageCheck } from "lucide-react";

const driverActions = [
  {
    title: "My Routes",
    icon: <Map className="h-8 w-8 text-primary" />,
    description: "View your daily routes and delivery schedule.",
  },
  {
    title: "Vehicle Check",
    icon: <Truck className="h-8 w-8 text-primary" />,
    description: "Complete your pre-trip and post-trip vehicle inspections.",
  },
  {
    title: "Track Deliveries",
    icon: <PackageCheck className="h-8 w-8 text-primary" />,
    description: "Update delivery status and view proof of delivery.",
  },
];

export default function DriverDashboard() {
  return (
    <div className="space-y-4">
      {driverActions.map((action) => (
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
