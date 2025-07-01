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
  [key: string]: any; // Allow other properties from the document
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
    // Direct API URL without the CORS proxy
    const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data from API...");
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`,
            },
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
            .filter((row: any) => row.doc && row.doc.shipment_id) // Filter for documents that are shipments
            .map((row: any) => ({
                id: row.id, // Use the top-level row ID as the unique document ID
                ...row.doc, // Spread all properties from the nested doc object
            }));

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to mock data.", error.message);
        return { shipments: mockShipments, isOnline: false };
    }
}


/**
 * MOCK FUNCTION: Simulates updating a shipment's status.
 * @param shipmentId The ID of the shipment to update.
 * @param newStatus The new status to set.
 * @returns A promise that resolves to a success or failure object.
 */
export async function updateShipmentStatus(
  shipmentId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  // This is a placeholder for a real API call.
  console.log(`Simulating update for shipment ID ${shipmentId} to status "${newStatus}"`);
  
  // In a real application, you would make a PUT/PATCH request here to your database.
  // For example:
  // const API_URL = `https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/${shipmentId}`;
  // const response = await fetch(API_URL, {
  //   method: 'PATCH', // or 'PUT'
  //   headers: { 
  //     'Content-Type': 'application/json', 
  //     'Authorization': `Basic ${basicAuth}`
  //   },
  //   body: JSON.stringify({ status: newStatus, _rev: 'current_rev' }) // Couchbase requires _rev for updates
  // });
  // if (!response.ok) {
  //   return { success: false, message: 'Failed to update shipment status.' };
  // }
  
  await new Promise(resolve => setTimeout(resolve, 750)); // Simulate network latency

  return { success: true, message: 'Shipment status updated successfully!' };
}