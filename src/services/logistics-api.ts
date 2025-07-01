'use server';

// This defines the expected structure for a shipment.
// It can be expanded with more fields from your API as needed.
export interface Shipment {
  id: string; 
  shipmentID: string;
  rfid?: string;
  origin: string;
  destination: string;
  status: string;
  items: { itemID: string; name: string; quantity: number }[];
}

const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true&limit=100';
const USERNAME = 'chaos_coder_01';
const PASSWORD = 'Uk$7QkWq7U2yiHCso';

// Base64 encode the credentials for Basic Authentication.
// NOTE: Storing credentials directly in code is not recommended for production.
// Use environment variables for better security.
const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function fetchAllShipments(): Promise<Shipment[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
       cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Logistics API Error:', { status: response.status, body: errorBody });
      throw new Error(`Failed to fetch data from logistics API. Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || !Array.isArray(data.rows)) {
        console.error('Invalid data structure received from API: "rows" array is missing.', data);
        throw new Error('Invalid data structure from API.');
    }

    // The documents are in the 'rows' array, inside the 'doc' property.
    // We filter out any potential design documents or other non-shipment entries.
    const shipments = data.rows
      .filter((row: any) => row && row.doc && row.doc.shipmentID)
      .map((row: any) => ({
        id: row.id || row.doc.shipmentID, // Fallback for id
        shipmentID: row.doc.shipmentID,
        rfid: row.doc.rfid,
        origin: row.doc.origin,
        destination: row.doc.destination,
        status: row.doc.status,
        items: row.doc.items || [],
      }));

    return shipments as Shipment[];

  } catch (error) {
    console.error('Error in fetchAllShipments:', error);
    // Re-throw the error so it can be caught and handled by the calling component.
    throw error;
  }
}
