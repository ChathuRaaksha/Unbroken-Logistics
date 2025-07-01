
'use server';

import { mockShipments } from './mock-data';

// Defines the structure of the 'logistics' object found in each document.
export interface Shipment {
  id: string; // The document ID, used for React keys
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

export interface FetchShipmentsResult {
    shipments: Shipment[];
    isOnline: boolean;
}

/**
 * Fetches all shipment documents.
 * Attempts to fetch from the live API first, then falls back to mock data on failure.
 * @returns A promise that resolves to an object containing the shipments array and an isOnline status.
 */
export async function fetchAllShipments(): Promise<FetchShipmentsResult> {
    const endpoint = 'https://e6f479e4-23e5-4a57-a35b-6c41648a0d9b-us-east1.apps.astra.datastax.com/api/rest/v2/keyspaces/unbroken/scp/query';
    const apiToken = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data from API...");
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Cassandra-Token': apiToken,
            },
            body: JSON.stringify({ query: "SELECT * FROM logistics" }),
            cache: 'no-store', // Disable caching to get fresh data
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        }

        const json = await response.json();
        
        const shipments = (json.data || []).map((item: any, index: number) => ({
            ...item,
            id: item.shipment_id || `shipment-${index}`, // Ensure a unique key
        })).filter((item: any) => item.shipment_id); // Filter out any potentially invalid records

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to mock data.", error.message);
        return { shipments: mockShipments, isOnline: false };
    }
}
