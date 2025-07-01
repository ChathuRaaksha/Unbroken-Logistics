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

const MOCK_DATA_KEY = 'unbroken_logistics_mock_data';

// Helper to get mock data, preferring localStorage
const getMockData = (): Shipment[] => {
    // This function will only be called on the client, so window is available
    if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(MOCK_DATA_KEY);
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.error("Failed to parse mock data from localStorage", e);
                // If parsing fails, fall back to default and reset localStorage
            }
        }
        // If no stored data, initialize it
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(mockShipments));
    }
    return mockShipments;
};


/**
 * Fetches all shipment documents.
 * Attempts to fetch from the live API first, then falls back to mock data on failure.
 * @returns A promise that resolves to an object containing the shipments array and an isOnline status.
 */
export async function fetchAllShipments(): Promise<FetchShipmentsResult> {
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

        const shipments: Shipment[] = json.rows
            .filter((row: any) => row.doc && row.doc.shipment_id)
            .map((row: any) => ({
                id: row.id,
                ...row.doc,
            }));

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to mock data.", error.message);
        const shipments = getMockData();
        return { shipments, isOnline: false };
    }
}


/**
 * MOCK FUNCTION: Simulates updating a shipment's status and persists it to localStorage.
 * @param shipmentId The ID of the shipment to update.
 * @param newStatus The new status to set.
 * @returns A promise that resolves to a success or failure object.
 */
export async function updateShipmentStatus(
  shipmentId: string,
  newStatus: string
): Promise<{ success: boolean; message: string }> {
  // Since we are now using localStorage, this function runs on the client
  console.log(`Updating shipment ID ${shipmentId} to status "${newStatus}" in localStorage.`);
  
  try {
    const currentShipments = getMockData();
    const shipmentIndex = currentShipments.findIndex(s => s.id === shipmentId);

    if (shipmentIndex === -1) {
        throw new Error("Shipment not found in mock data.");
    }

    // Update the shipment
    currentShipments[shipmentIndex] = {
        ...currentShipments[shipmentIndex],
        status: newStatus,
        timestamp: new Date().toISOString(), // Update timestamp to reflect the change
    };

    // Save back to localStorage
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(currentShipments));

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

    return { success: true, message: 'Shipment status updated successfully!' };
  } catch (error: any) {
     console.error("Failed to update mock data in localStorage", error);
     return { success: false, message: `Failed to update status: ${error.message}` };
  }
}