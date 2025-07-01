"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Truck, PackageCheck, PackageX, PackageSearch, Clock, MapPin, Hash } from "lucide-react";
import { fetchAllShipments, Shipment } from '@/services/logistics-api';
import { Badge } from "@/components/ui/badge";

const DriverDashboard = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadShipments = async () => {
      setLoading(true);
      setError(null);
      try {
        const allShipments = await fetchAllShipments();
        // Filter for shipments handled by a driver
        const driverShipments = allShipments.filter(s => s.handler_role === 'driver');
        setShipments(driverShipments);
      } catch (err: any) {
        console.error("Error fetching driver data:", err);
        setError(`Failed to fetch shipment data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadShipments();
  }, []);

  const handleRowClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDialogOpen(true);
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'delivered': return 'default';
        case 'in_transit': return 'secondary';
        case 'delayed': return 'destructive';
        default: return 'outline';
    }
  };

  const getPackageConditionIcon = (condition: string) => {
      switch (condition?.toLowerCase()) {
          case 'intact': return <PackageCheck className="h-5 w-5 text-green-600" />;
          case 'damaged': return <PackageX className="h-5 w-5 text-orange-500" />;
          case 'missing': return <PackageSearch className="h-5 w-5 text-red-600" />;
          default: return <span>{condition || 'N/A'}</span>;
      }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading Your Shipments...</p>
        </div>
    );
  }

  if (error) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>{error}</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Active Shipments</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="w-full overflow-auto border rounded-md max-h-96">
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead>Shipment ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Origin</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Package Condition</TableHead>
                          <TableHead>Timestamp</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {shipments.length > 0 ? (
                          shipments.map((shipment) => (
                              <TableRow key={shipment.id} onClick={() => handleRowClick(shipment)} className="cursor-pointer">
                                  <TableCell className="font-medium">{shipment.shipment_id}</TableCell>
                                  <TableCell><Badge variant={getStatusVariant(shipment.status)}>{shipment.status.replace(/_/g, ' ')}</Badge></TableCell>
                                  <TableCell>{shipment.origin}</TableCell>
                                  <TableCell>{shipment.destination}</TableCell>
                                  <TableCell><div className="flex justify-center">{getPackageConditionIcon(shipment.package_condition)}</div></TableCell>
                                  <TableCell>{new Date(shipment.timestamp).toLocaleDateString()}</TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={6} className="text-center h-24">
                                  No active shipments assigned to you.
                              </TableCell>
                          </TableRow>
                      )}
                      </TableBody>
                  </Table>
              </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
              {selectedShipment && (
                  <>
                      <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Truck className="h-6 w-6" />
                            Shipment #{selectedShipment.shipment_id}
                          </DialogTitle>
                          <DialogDescription>
                              Detailed view of the shipment's information.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Status</span>
                              <Badge variant={getStatusVariant(selectedShipment.status)} className="w-fit">{selectedShipment.status.replace(/_/g, ' ')}</Badge>
                          </div>
                           <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">RFID Tag</span>
                              <span className="flex items-center gap-2 font-mono text-sm"><Hash className="h-4 w-4" /> {selectedShipment.rfid || 'N/A'}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Origin</span>
                              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedShipment.origin}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Destination</span>
                              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedShipment.destination}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Package</span>
                              <span className="flex items-center gap-2">{getPackageConditionIcon(selectedShipment.package_condition)} {selectedShipment.package_condition}</span>
                          </div>
                           <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Last Update</span>
                              <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(selectedShipment.timestamp).toLocaleString()}</span>
                          </div>
                           <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">Handoff Point</span>
                              <span>{selectedShipment.handoff_point || 'N/A'}</span>
                          </div>
                      </div>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
};

export default DriverDashboard;
