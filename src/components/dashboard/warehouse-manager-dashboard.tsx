
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, Package, Truck, Timer, BarChart as BarChartIcon, CheckCircle as CheckCircleIcon } from "lucide-react";
import { fetchAllShipments, Shipment } from '@/services/logistics-api';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';

export default function WarehouseManagerDashboard() {
    const [allShipments, setAllShipments] = useState<Shipment[]>([]);
    const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchType, setSearchType] = useState('shipment_id');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadShipments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const shipments = await fetchAllShipments();
                setAllShipments(shipments);
                setFilteredShipments(shipments);
            } catch (e: any) {
                setError(e.message || 'Failed to load shipment data. Please check the connection and try again.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadShipments();
    }, []);

    const stats = useMemo(() => {
        return {
            total: allShipments.length,
            inTransit: allShipments.filter(s => s.status === 'in_transit').length,
            delayed: allShipments.filter(s => s.status === 'delayed').length,
            delivered: allShipments.filter(s => s.status === 'delivered').length,
        }
    }, [allShipments]);

    const chartData = useMemo(() => {
        const statusCounts = allShipments.reduce((acc, shipment) => {
            const status = shipment.status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    }, [allShipments]);

    const chartConfig: ChartConfig = {
      count: {
        label: "Shipments",
      },
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setFilteredShipments(allShipments);
            return;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const results = allShipments.filter(shipment => {
            const valueToSearch = shipment[searchType as keyof Shipment] as string | undefined;
            return valueToSearch?.toLowerCase().includes(lowercasedTerm);
        });
        setFilteredShipments(results);
    };
    
    const uniqueStatuses = useMemo(() => {
        const statuses = new Set(allShipments.map(s => s.status));
        return Array.from(statuses);
    }, [allShipments]);

    const handleStatusFilter = (status: string) => {
        if (!status || status === 'all') {
             setFilteredShipments(allShipments);
        } else {
            const results = allShipments.filter(s => s.status === status);
            setFilteredShipments(results);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-6 w-6" /> Shipment Status Overview</CardTitle>
                    <CardDescription>A summary of all shipments by their current status.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : chartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
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
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
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
                    <CardTitle className="flex items-center gap-2"><Search className="h-6 w-6" /> Shipment Lookup</CardTitle>
                    <CardDescription>Search for shipments by ID, RFID, or filter by status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Select value={searchType} onValuechange={(value) => setSearchType(value)}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Search by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shipment_id">Shipment ID</SelectItem>
                                <SelectItem value="rfid">RFID</SelectItem>
                            </SelectContent>
                        </Select>
                        {searchType === 'status' ? (
                             <Select onValueChange={handleStatusFilter}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {uniqueStatuses.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                type="text"
                                placeholder={`Enter ${searchType === 'rfid' ? 'RFID' : 'Shipment ID'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                        )}
                        {searchType !== 'status' && <Button type="submit" disabled={isLoading}>Search</Button>}
                    </form>
                    
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
                         <div className="w-full overflow-auto border rounded-md max-h-96">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card z-10">
                                    <TableRow>
                                        <TableHead>Shipment ID</TableHead>
                                        <TableHead>Origin</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>RFID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredShipments.length > 0 ? (
                                        filteredShipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
