
'use server';

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

const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true&limit=100';
const USERNAME = 'chaos_coder_01';
const PASSWORD = 'Uk$7QkWq7U2yiHCso'; // Corrected and verified password

// Base64 encode the credentials for Basic Authentication.
const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

/**
 * Fetches all shipment documents from the Couchbase Sync Gateway.
 * This is a server action and handles credentials securely on the server.
 * @returns A promise that resolves to an array of shipments.
 */
export async function fetchAllShipments(): Promise<Shipment[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      },
       // This prevents caching of failed responses and ensures fresh data.
       cache: 'no-store',
    });

    if (!response.ok) {
       // If the server responded with an error, log the details for debugging.
       const errorBody = await response.text();
       console.error(`API Error: ${response.status}`, errorBody);
       throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || !Array.isArray(data.rows)) {
      console.error('Invalid data structure from API:', data);
      throw new Error('Invalid data structure from API: "rows" array is missing.');
    }

    // Map the raw data to our clean Shipment interface
    const shipments: Shipment[] = data.rows
      .map((row: any) => {
        // The actual shipment data is expected in row.doc.logistics
        if (row.doc && row.doc.logistics && row.doc.logistics.shipment_id) {
          const logisticsData = row.doc.logistics;
          return {
            id: row.id, // Use the document ID as the unique key
            destination: logisticsData.destination || 'N/A',
            handler_role: logisticsData.handler_role || 'N/A',
            handoff_point: logisticsData.handoff_point || 'N/A',
            item_id: logisticsData.item_id || 'N/A',
            origin: logisticsData.origin || 'N/A',
            package_condition: logisticsData.package_condition || 'N/A',
            rfid: logisticsData.rfid || 'N/A',
            shipment_id: logisticsData.shipment_id,
            status: logisticsData.status || 'N/A',
            timestamp: logisticsData.timestamp || 'N/A',
          };
        }
        return null; // Ignore rows that don't have the expected data
      })
      .filter((shipment: Shipment | null): shipment is Shipment => shipment !== null);

    return shipments;

  } catch (error) {
    console.error('Error in fetchAllShipments:', error);
    // Re-throw to be handled by the calling component
    throw new Error('Failed to load shipment data. Please check the connection and try again.');
  }
}
