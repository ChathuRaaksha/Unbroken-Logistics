
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, AlertCircle, Package, Truck, Timer, BarChart as BarChartIcon, CheckCircle as CheckCircleIcon, Edit, X, PackageCheck, Map, Globe } from "lucide-react";
import { fetchAllShipments, Shipment, FetchShipmentsResult, updateShipment } from '@/services/logistics-api';
import { useAuth } from "@/hooks/use-auth";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';


export default function WarehouseStaffDashboard() {
    const [allShipments, setAllShipments] = useState<Shipment[]>([]);
    const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchType, setSearchType] = useState('shipment_id');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { setIsOnline, lastSyncTime } = useAuth();
    const { toast } = useToast();

    // State for the edit dialog
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editableData, setEditableData] = useState<Partial<Shipment>>({});

    const uniqueStatuses = useMemo(() => ['picked_up', 'in_transit', 'delayed', 'delivered'], []);
    const uniqueHandlerRoles = useMemo(() => ['driver', 'dock_worker', 'warehouse_staff'], []);
    const uniquePackageConditions = useMemo(() => ['intact', 'damaged', 'missing'], []);

    const loadShipments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { shipments, isOnline }: FetchShipmentsResult = await fetchAllShipments();
            setAllShipments(shipments);
            setFilteredShipments(shipments);
            setIsOnline(isOnline);
        } catch (e: any) {
            setError(e.message || 'Failed to process shipment data. Please try again.');
            console.error(e);
            setIsOnline(false);
        } finally {
            setIsLoading(false);
        }
    }, [setIsOnline]);

    useEffect(() => {
        loadShipments();
    }, [loadShipments, lastSyncTime]);

    useEffect(() => {
        let results = allShipments;
        
        if (statusFilter !== 'all') {
            results = results.filter(s => s.status === statusFilter);
        }

        if (searchTerm.trim()) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(shipment => {
                const valueToSearch = shipment[searchType as keyof Shipment] as string | undefined;
                return valueToSearch?.toLowerCase().includes(lowercasedTerm);
            });
        }
        
        setFilteredShipments(results);
        setCurrentPage(1);

    }, [searchTerm, searchType, statusFilter, allShipments]);


    const paginatedShipments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredShipments.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredShipments, currentPage, rowsPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredShipments.length / rowsPerPage), [filteredShipments, rowsPerPage]);

     const stats = useMemo(() => {
        const source = allShipments; // Use all shipments from the latest fetch
        return {
            total: source.length,
            inTransit: source.filter(s => s.status === 'in_transit').length,
            delayed: source.filter(s => s.status === 'delayed').length,
            delivered: source.filter(s => s.status === 'delivered').length,
            pickedUp: source.filter(s => s.status === 'picked_up').length,
        }
    }, [allShipments]);


    const statusChartData = useMemo(() => {
        const source = allShipments;
        const statusCounts = source.reduce((acc, shipment) => {
            const status = shipment.status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    }, [allShipments]);
    
    const chartConfig: ChartConfig = {
      count: { label: "Shipments" },
      picked_up: { label: "Picked Up", color: "hsl(var(--chart-1))" },
      in_transit: { label: "In Transit", color: "hsl(var(--chart-2))" },
      delayed: { label: "Delayed", color: "hsl(var(--chart-3))" },
      delivered: { label: "Delivered", color: "hsl(var(--chart-4))" },
      unknown: { label: "Unknown", color: "hsl(var(--chart-5))" },
    };

    const destinationChartData = useMemo(() => {
        const destinationCounts = allShipments.reduce((acc, shipment) => {
            const dest = shipment.destination || "Unknown";
            acc[dest] = (acc[dest] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(destinationCounts)
            .map(([destination, count]) => ({ destination, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [allShipments]);

     const destinationChartConfig: ChartConfig = {
        count: { label: "Shipments", color: "hsl(var(--chart-1))" },
    };
    
    const handlePreviousPage = () => (currentPage > 1) && setCurrentPage(currentPage - 1);
    const handleNextPage = () => (currentPage < totalPages) && setCurrentPage(currentPage + 1);
    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleRowClick = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setEditableData(shipment);
        setIsDialogOpen(true);
    };

    const handleUpdateField = (field: keyof Shipment, value: string) => {
        setEditableData(prev => ({...prev, [field]: value}));
    };
    
    const hasChanges = useMemo(() => {
        if (!selectedShipment) return false;
        return JSON.stringify(selectedShipment) !== JSON.stringify(editableData);
    }, [selectedShipment, editableData]);

    const handleSaveChanges = async () => {
        if (!selectedShipment || !hasChanges) return;
        setIsUpdating(true);
        
        const result = await updateShipment(selectedShipment, editableData);

        if (result.success && result.updatedShipment) {
            setAllShipments(prev => prev.map(s => s.id === result.updatedShipment!.id ? result.updatedShipment! : s));
            toast({ title: 'Update Queued', description: result.message });
            setIsDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
            loadShipments();
        }
        setIsUpdating(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Picked Up</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pickedUp}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inTransit}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.delayed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                        <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.delivered}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-6 w-6" /> Shipment Status Overview</CardTitle>
                        <CardDescription>A summary of all shipments by their current status.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : statusChartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={statusChartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis 
                                        dataKey="status" 
                                        tickLine={false} 
                                        tickMargin={10} 
                                        axisLine={false}
                                        tickFormatter={(value) => value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={4}>
                                        {statusChartData.map((entry) => (
                                            <Cell key={`cell-${entry.status}`} fill={chartConfig[entry.status as keyof typeof chartConfig]?.color || "hsl(var(--chart-5))"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-muted-foreground">No chart data available.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-6 w-6" /> Top 5 Destinations</CardTitle>
                        <CardDescription>Breakdown of the most frequent shipment destinations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isLoading ? (
                            <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : destinationChartData.length > 0 ? (
                            <ChartContainer config={destinationChartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={destinationChartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                                    <CartesianGrid horizontal={false} />
                                    <YAxis 
                                        dataKey="destination" 
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        width={80}
                                    />
                                    <XAxis dataKey="count" type="number" hide />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" layout="vertical" radius={5} fill="var(--color-count)">
                                         <LabelList
                                            dataKey="count"
                                            position="right"
                                            offset={8}
                                            className="fill-foreground font-semibold"
                                            fontSize={12}
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                             <div className="flex justify-center items-center h-64">
                                <p className="text-muted-foreground">No destination data available.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Search className="h-6 w-6" /> Shipment Lookup</CardTitle>
                    <CardDescription>Search for shipments by ID, RFID, or filter by status.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="flex-1 flex gap-2">
                           <Select value={searchType} onValueChange={(value) => {
                                setSearchType(value);
                                setSearchTerm('');
                            }}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Search by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shipment_id">Shipment ID</SelectItem>
                                    <SelectItem value="rfid">RFID</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={`Search by ${searchType === 'rfid' ? 'RFID' : 'Shipment ID'}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {uniqueStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2">Loading Shipments...</p>
                        </div>
                    ) : error ? (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <>
                         <div className="w-full overflow-auto border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shipment ID</TableHead>
                                        <TableHead>Origin</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>RFID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedShipments.length > 0 ? (
                                        paginatedShipments.map((shipment) => (
                                            <TableRow key={shipment.id} onClick={() => handleRowClick(shipment)} className="cursor-pointer">
                                                <TableCell className="font-medium">{shipment.shipment_id}</TableCell>
                                                <TableCell>{shipment.origin}</TableCell>
                                                <TableCell>{shipment.destination}</TableCell>
                                                <TableCell>{shipment.status}</TableCell>
                                                <TableCell>{shipment.rfid || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                No shipments found.
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
                      </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                     {selectedShipment && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Edit className="h-6 w-6"/>
                                    Edit Shipment #{selectedShipment.shipment_id}
                                </DialogTitle>
                                <DialogDescription>
                                    Update the details for this shipment. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="origin" className="text-right">Origin</Label>
                                    <Input id="origin" value={editableData.origin || ''} onChange={(e) => handleUpdateField('origin', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="destination" className="text-right">Destination</Label>
                                    <Input id="destination" value={editableData.destination || ''} onChange={(e) => handleUpdateField('destination', e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="handoff" className="text-right">Handoff</Label>
                                    <Input id="handoff" value={editableData.handoff_point || ''} onChange={(e) => handleUpdateField('handoff_point', e.target.value)} className="col-span-3" />
                                </div>
                                 <Separator />
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Status</Label>
                                    <Select value={editableData.status} onValueChange={(value) => handleUpdateField('status', value)}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status..." /></SelectTrigger>
                                        <SelectContent>
                                            {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="handler" className="text-right">Handler</Label>
                                    <Select value={editableData.handler_role} onValueChange={(value) => handleUpdateField('handler_role', value)}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select handler..." /></SelectTrigger>
                                        <SelectContent>
                                            {uniqueHandlerRoles.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="condition" className="text-right">Condition</Label>
                                    <Select value={editableData.package_condition} onValueChange={(value) => handleUpdateField('package_condition', value)}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select condition..." /></SelectTrigger>
                                        <SelectContent>
                                            {uniquePackageConditions.map(c => <SelectItem key={c} value={c}>{c.replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                                <Button onClick={handleSaveChanges} disabled={!hasChanges || isUpdating}>
                                    {isUpdating ? <Loader2 className="animate-spin" /> : <><CheckCircleIcon className="mr-2 h-4 w-4"/>Save Changes</>}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );

    
}

    
