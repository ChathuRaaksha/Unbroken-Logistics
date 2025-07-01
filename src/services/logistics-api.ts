
'use server';

import { mockShipments } from './mock-data';

// Defines the structure of the 'logistics' object found in each document.
export interface Shipment {
  id: string; // The document ID from Couchbase, used for React keys
  destination: string;
  handler_role: string;
  handoff_point: string;
  item_id: string;
  origin: string;
  package_condition: string;
  rfid: string;
  shipment_id: string;
  status: string;
  timestamp: string;
}

/**
 * Fetches all shipment documents.
 * @returns A promise that resolves to an array of shipments.
 */
export async function fetchAllShipments(): Promise<Shipment[]> {
    // --- MOCK IMPLEMENTATION ---
    // This is a mock implementation that returns a static list of shipments.
    // This is useful for development and testing when the live API is not available.
    console.log("Returning mock shipment data.");
    return Promise.resolve(mockShipments);
}

