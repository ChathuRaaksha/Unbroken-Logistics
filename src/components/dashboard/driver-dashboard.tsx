"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Truck, PackageCheck, PackageX, PackageSearch, Clock, MapPin, Hash, Search } from "lucide-react";
import { fetchAllShipments, Shipment, FetchShipmentsResult, updateShipment } from '@/services/logistics-api';
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";


const DriverDashboard = () => {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [editableStatus, setEditableStatus] = useState("");
  
  const { setIsOnline } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadShipments = async () => {
      setLoading(true);
      setError(null);
      try {
        const { shipments, isOnline }: FetchShipmentsResult = await fetchAllShipments();
        const driverShipments = shipments.filter(s => s.handler_role === 'driver');
        setAllShipments(driverShipments);
        setIsOnline(isOnline);
      } catch (err: any) {
        console.error("Error processing driver data:", err);
        setError(`Failed to process shipment data: ${err.message}`);
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadShipments();
  }, [setIsOnline]);
  
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

  const handleRowClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setEditableStatus(shipment.status);
    setIsDialogOpen(true);
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'delivered': return 'default';
        case 'in_transit': return 'secondary';
        case 'delayed': return 'destructive';
        case 'picked_up': return 'outline';
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

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !editableStatus || editableStatus === selectedShipment.status) return;

    setIsUpdating(true);
    const result = await updateShipment(selectedShipment.id, { status: editableStatus });

    if (result.success && result.updatedShipment) {
        setAllShipments(prevShipments =>
            prevShipments.map(s =>
                s.id === selectedShipment.id ? result.updatedShipment! : s
            )
        );
        toast({ title: "Success", description: result.message });
        setIsDialogOpen(false);
    } else {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: result.message,
        });
    }
    setIsUpdating(false);
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
                          <TableHead>Package Condition</TableHead>
                          <TableHead>Timestamp</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {paginatedShipments.length > 0 ? (
                          paginatedShipments.map((shipment) => (
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
                                  No active shipments found.
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
                      <Separator />
                      <div className="space-y-4">
                          <Label htmlFor="status-update" className="text-base font-semibold">Update Status</Label>
                          <div className="flex gap-2">
                            <Select value={editableStatus} onValueChange={setEditableStatus}>
                                <SelectTrigger id="status-update">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="picked_up">Picked Up</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleUpdateStatus}
                                disabled={isUpdating || editableStatus === selectedShipment.status}
                                className="w-[120px]"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" /> : 'Update'}
                            </Button>
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
