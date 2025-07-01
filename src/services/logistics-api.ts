// Defines the structure of the 'logistics' object found in each document.
export interface Shipment {
  id: string; // The document ID, used for React keys
  _id: string;
  _rev: string;
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
    const API_URL = 'https://cors-anywhere.herokuapp.com/https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true&limit=500';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data from API...");
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              'x-requested-with': 'XMLHttpRequest'
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
                id: row.id,
                ...row.doc,
            }));

        console.log(`Successfully fetched ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data.", error.message);
        return { shipments: [], isOnline: false };
    }
}


/**
 * Updates a shipment's details in the live database.
 * @param shipment The current shipment object, which must include its _id and _rev.
 * @param updates An object containing the fields to update.
 * @returns A promise that resolves to a success or failure object.
 */
export async function updateShipment(
  shipment: Shipment,
  updates: Partial<Omit<Shipment, 'id'>>
): Promise<{ success: boolean; message: string; updatedShipment?: Shipment }> {
    const API_URL_BASE = 'https://cors-anywhere.herokuapp.com/https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    if (!shipment?._rev) {
        return {
            success: false,
            message: 'Cannot update document without a revision number. Please refresh and try again.',
        };
    }

    // Prepare the document for update.
    // Start with the original document, spread the updates, and ensure the _rev is correct.
    const { id, ...doc } = shipment;
    const updatedDoc = {
        ...doc,
        ...updates
    };

    try {
        console.log(`Attempting to update shipment ID ${shipment.id} with`, updates);
        const response = await fetch(`${API_URL_BASE}${shipment.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
                'x-requested-with': 'XMLHttpRequest'
            },
            body: JSON.stringify(updatedDoc),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.reason || `API call failed with status ${response.status}`);
        }

        // Return the successfully updated document, with its new revision number.
        const returnedShipment: Shipment = {
            ...updatedDoc,
            id: result.id,
            _id: result.id,
            _rev: result.rev,
        };
        
        return {
            success: true,
            message: 'Shipment updated successfully!',
            updatedShipment: returnedShipment,
        };

    } catch (error: any) {
        console.error('Failed to update shipment:', error.message);
        return {
            success: false,
            message: error.message || 'An unexpected error occurred while updating the shipment.',
        };
    }
}
