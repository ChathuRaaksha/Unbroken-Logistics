"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { fetchAllShipments, Shipment } from '@/services/logistics-api';

export default function WarehouseManagerDashboard() {
    const [allShipments, setAllShipments] = useState<Shipment[]>([]);
    const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchType, setSearchType] = useState('shipmentID');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadShipments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const shipments = await fetchAllShipments();
                const validShipments = shipments.filter(s => s.shipmentID && s.status);
                setAllShipments(validShipments);
                setFilteredShipments(validShipments);
            } catch (e) {
                setError('Failed to load shipment data. Please check the connection and try again.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadShipments();
    }, []);

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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Search className="h-6 w-6" /> Shipment Lookup</CardTitle>
                    <CardDescription>Search for shipments by ID, RFID, or filter by status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Select value={searchType} onValueChange={(value) => {
                            setSearchType(value);
                            setSearchTerm('');
                            setFilteredShipments(allShipments);
                        }}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Search by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shipmentID">Shipment ID</SelectItem>
                                <SelectItem value="rfid">RFID</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
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
                                                <TableCell className="font-medium">{shipment.shipmentID}</TableCell>
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
