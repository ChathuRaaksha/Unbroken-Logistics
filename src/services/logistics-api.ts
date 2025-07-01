
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
 * THIS IS CURRENTLY USING MOCK DATA TO AVOID API CONNECTION ISSUES.
 * To re-enable the live API, comment out the mock implementation and uncomment the try/catch block.
 * @returns A promise that resolves to an array of shipments.
 */
export async function fetchAllShipments(): Promise<Shipment[]> {
  console.log("Fetching mock shipment data.");
  // Using mock data to allow UI development to proceed.
  return new Promise(resolve => {
    setTimeout(() => {
        resolve(mockShipments);
    }, 500); // Simulate network delay
  });

  /*
  // --- LIVE API IMPLEMENTATION ---
  // The code below is for connecting to the live Couchbase API.
  // It has been commented out to work around persistent connection errors.

  const API_URL = 'https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true&limit=100';
  const USERNAME = 'chaos_coder_01';
  const PASSWORD = 'Uk$7QkWq7U2yiHCso';

  const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      },
       cache: 'no-store',
    });

    if (!response.ok) {
       const errorBody = await response.text();
       console.error(`API Error: ${response.status}`, errorBody);
       throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rows || !Array.isArray(data.rows)) {
      console.error('Invalid data structure from API:', data);
      throw new Error('Invalid data structure from API: "rows" array is missing.');
    }

    const shipments: Shipment[] = data.rows
      .map((row: any) => {
        if (row.doc && row.doc.logistics && row.doc.logistics.shipment_id) {
          const logisticsData = row.doc.logistics;
          return {
            id: row.id,
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
        return null;
      })
      .filter((shipment: Shipment | null): shipment is Shipment => shipment !== null);

    return shipments;

  } catch (error) {
    console.error('Error in fetchAllShipments:', error);
    throw new Error('Failed to load shipment data. Please check the connection and try again.');
  }
  */
}
