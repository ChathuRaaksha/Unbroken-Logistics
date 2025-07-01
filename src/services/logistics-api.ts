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

const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true';
const USERNAME = 'chaos_coder_01';
const PASSWORD = 'Uk$7QkWq7U2yiHC';

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
      // In a real production environment, you would want to ensure the server
      // certificate is fully trusted. For development, direct API calls like this
      // often require more lenient security settings if certificates are self-signed.
      // Next.js fetch handles this reasonably well on the server.
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Logistics API Error:', response.status, errorBody);
      throw new Error(`Failed to fetch data from logistics API. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // The documents are in the 'rows' array, inside the 'doc' property.
    // We also filter out any potential design documents or other non-shipment entries.
    const shipments = data.rows
      .filter((row: any) => row.doc && row.doc.shipmentID)
      .map((row: any) => ({
        id: row.id,
        ...row.doc
      }));

    return shipments as Shipment[];

  } catch (error) {
    console.error('Error in fetchAllShipments:', error);
    // Re-throw the error so it can be caught and handled by the calling component.
    throw error;
  }
}
