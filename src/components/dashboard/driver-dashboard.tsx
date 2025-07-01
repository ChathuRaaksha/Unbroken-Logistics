"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Truck, Map, Clock } from "lucide-react";

// Define the shape of the shipment data based on the API response
interface ShipmentLogistics {
  shipment_id: string;
  status: string;
  origin: string;
  destination: string;
  package_condition: string;
  timestamp: string;
  handler_role: string;
}

const DriverDashboard = () => {
  const [shipments, setShipments] = useState<ShipmentLogistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API endpoint and credentials
  const listUrl = "https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?limit=100";
  const detailUrlBase = "https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/";
  const username = "chaos_coder_01";
  const password = "Uk$7QkWq7U2yiHCso"; // Correct password

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(listUrl, {
          method: "GET",
          headers: {
            "Authorization": "Basic " + btoa(`${username}:${password}`),
            "Content-Type": "application/json",
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`API list request failed with status ${response.status}`);
        }
        
        const data = await response.json();

        // Fetch details for each shipment
        const shipmentDetailsPromises = data.rows.map(async (shipment: any) => {
          const detailResponse = await fetch(
            `${detailUrlBase}${shipment.id}`,
            {
              method: "GET",
              headers: {
                "Authorization": "Basic " + btoa(`${username}:${password}`),
                "Content-Type": "application/json",
              },
              cache: 'no-store',
            }
          );
          if (!detailResponse.ok) {
            console.warn(`Failed to fetch details for shipment ${shipment.id}`);
            return null; // Skip this one if it fails
          }
          const shipmentDetail = await detailResponse.json();
          return shipmentDetail.logistics; // Extract the 'logistics' object
        });

        // Wait for all promises to resolve
        const fullShipments = (await Promise.all(shipmentDetailsPromises))
            .filter(Boolean) as ShipmentLogistics[]; // Filter out nulls and falsy values

        // Filter for shipments handled by a driver
        const driverShipments = fullShipments.filter(s => s && s.handler_role === 'driver');
        
        setShipments(driverShipments);

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(`Failed to fetch shipment data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                        shipments.map((shipment, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{shipment.shipment_id}</TableCell>
                                <TableCell>{shipment.status}</TableCell>
                                <TableCell>{shipment.origin}</TableCell>
                                <TableCell>{shipment.destination}</TableCell>
                                <TableCell>{shipment.package_condition}</TableCell>
                                <TableCell>{shipment.timestamp}</TableCell>
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
      </div>
    </div>
  );
};

export default DriverDashboard;
