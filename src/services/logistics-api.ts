
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
    // Removed the cors-anywhere proxy and added include_docs=true to get full document data
    const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?limit=500&include_docs=true';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data directly from API...");
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              // Server-to-server requests don't have CORS issues, so Origin/X-Requested-With are not needed.
            },
            cache: 'no-store', // Disable caching to ensure fresh data
          });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        }

        const json = await response.json();

        if (!json.rows) {
            throw new Error('API response is missing the "rows" property.');
        }

        // Correctly parse the Couchbase response structure
        const shipments: Shipment[] = json.rows
            .filter((row: any) => row.doc && row.doc.logistics) // Ensure the document and logistics data exist
            .map((row: any) => ({
                id: row.id, // Use the document ID from Couchbase as the unique key
                ...row.doc.logistics,
            }));

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to mock data.", error.message);
        return { shipments: mockShipments, isOnline: false };
    }
}
