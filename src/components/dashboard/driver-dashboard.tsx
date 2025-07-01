import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Truck, PackageCheck, ScanLine, Clock, MapPin } from "lucide-react";

// Mock data for active shipments
const activeShipments = [
  {
    id: "SHP-001",
    origin: "Warehouse A, New York, NY",
    destination: "Client Hub, Boston, MA",
    status: "In Transit",
  },
  {
    id: "SHP-002",
    origin: "Warehouse A, New York, NY",
    destination: "Distribution Center, Philadelphia, PA",
    status: "Out for Delivery",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "In Transit":
      return "default";
    case "Out for Delivery":
      return "secondary";
    default:
      return "outline";
  }
};

export default function DriverDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Active Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeShipments.map((shipment) => (
            <Card key={shipment.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex justify-between items-center">
                  <span>{shipment.id}</span>
                  <Badge variant={getStatusVariant(shipment.status) as any}>{shipment.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                 <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary/70"/> <strong>From:</strong> {shipment.origin}</p>
                 <p className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary/70"/> <strong>To:</strong> {shipment.destination}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2"><Map className="h-5 w-5"/> Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
               <p><strong>Current Route:</strong> NY-MA-90</p>
               <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> <strong>Next Stop ETA:</strong> 45 minutes</p>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg">
            <ScanLine className="h-5 w-5 mr-2" />
            Scan Package (QR)
          </Button>
      </div>
    </div>
  );
}
