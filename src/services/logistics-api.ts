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
 * Fetches all shipment documents from the live API.
 * @returns A promise that resolves to an object containing the shipments array and an isOnline status.
 */
export async function fetchAllShipments(): Promise<FetchShipmentsResult> {
    // NOTE: Using a CORS proxy for client-side development.
    // In a production environment, you would typically have a backend service
    // that communicates with the database to avoid CORS issues and secure credentials.
    const API_URL = 'https://cors-anywhere.herokuapp.com/https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true&limit=500';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data from API...");
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              'x-requested-with': 'XMLHttpRequest' // Required by some CORS proxies
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

        const shipments: Shipment[] = json.rows
            .filter((row: any) => row.doc && row.doc.shipment_id && typeof row.doc.shipment_id === 'string')
            .map((row: any) => ({
                id: row.id, // Use the document ID for the key
                ...row.doc,
            }));

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data.", error.message);
        // Return empty array and offline status on failure.
        // The UI components will handle displaying an error or empty state.
        return { shipments: [], isOnline: false };
    }
}


/**
 * Updates a shipment's details.
 * NOTE: This is a placeholder. A real implementation would require a secure backend endpoint
 * to communicate with the database.
 * @param shipmentId The ID of the shipment to update.
 * @param updates An object containing the fields to update.
 * @returns A promise that resolves to a success or failure object.
 */
export async function updateShipment(
  shipmentId: string,
  updates: Partial<Omit<Shipment, 'id'>>
): Promise<{ success: boolean; message: string; updatedShipment?: Shipment }> {
    console.log(`Attempted to update shipment ID ${shipmentId} with`, updates);
    // This is a placeholder. In a real app, you would make a PUT/POST request
    // to your backend, which would then update the database.
    // For now, we'll return a failure message to indicate it's not implemented.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    return { 
        success: false, 
        message: 'Live database updates are not implemented in this prototype.' 
    };
}
