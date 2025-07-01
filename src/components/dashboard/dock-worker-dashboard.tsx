"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package } from "lucide-react";
import { fetchAllShipments, Shipment } from '@/services/logistics-api';

const DockWorkerDashboard = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShipments = async () => {
      setLoading(true);
      setError(null);
      try {
        const allShipments = await fetchAllShipments();
        // Filter for shipments handled by a dock worker
        const dockWorkerShipments = allShipments.filter(s => s.handler_role === 'dock_worker');
        setShipments(dockWorkerShipments);
      } catch (err: any) {
        console.error("Error fetching dock worker data:", err);
        setError(`Failed to fetch shipment data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadShipments();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading Assigned Shipments...</p>
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
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5"/> Pending Shipments</CardTitle>
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
                        <TableHead>Handoff Point</TableHead>
                        <TableHead>Timestamp</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {shipments.length > 0 ? (
                        shipments.map((shipment) => (
                            <TableRow key={shipment.id}>
                                <TableCell className="font-medium">{shipment.shipment_id}</TableCell>
                                <TableCell>{shipment.status}</TableCell>
                                <TableCell>{shipment.origin}</TableCell>
                                <TableCell>{shipment.destination}</TableCell>
                                <TableCell>{shipment.handoff_point}</TableCell>
                                <TableCell>{shipment.timestamp}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No pending shipments assigned to you.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DockWorkerDashboard;
