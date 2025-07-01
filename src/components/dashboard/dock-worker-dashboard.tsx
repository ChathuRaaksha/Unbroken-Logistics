"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Search } from "lucide-react";
import { fetchAllShipments, Shipment } from '@/services/logistics-api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DockWorkerDashboard = () => {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadShipments = async () => {
      setLoading(true);
      setError(null);
      try {
        const shipments = await fetchAllShipments();
        const dockWorkerShipments = shipments.filter(s => s.handler_role === 'dock_worker');
        setAllShipments(dockWorkerShipments);
      } catch (err: any) {
        console.error("Error fetching dock worker data:", err);
        setError(`Failed to fetch shipment data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadShipments();
  }, []);

  const filteredShipments = useMemo(() => {
    if (!searchTerm) return allShipments;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allShipments.filter(s =>
      s.shipment_id.toLowerCase().includes(lowercasedTerm) ||
      s.origin.toLowerCase().includes(lowercasedTerm) ||
      s.destination.toLowerCase().includes(lowercasedTerm)
    );
  }, [allShipments, searchTerm]);

  const paginatedShipments = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredShipments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredShipments, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredShipments.length / rowsPerPage), [filteredShipments, rowsPerPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

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
            <div className="flex items-center py-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, origin, destination..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10 w-full md:w-1/2 lg:w-1/3"
                    />
                </div>
            </div>
            <div className="w-full overflow-auto border rounded-md">
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
                    {paginatedShipments.length > 0 ? (
                        paginatedShipments.map((shipment) => (
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
                                No pending shipments found.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {filteredShipments.length} shipment(s) found.
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select value={`${rowsPerPage}`} onValueChange={handleRowsPerPageChange}>
                        <SelectTrigger className="w-[75px]">
                            <SelectValue placeholder={rowsPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-end space-x-2">
                     <span className="text-sm text-muted-foreground">
                        Page {totalPages > 0 ? currentPage : 0} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DockWorkerDashboard;
