


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

const SHIPMENTS_CACHE_KEY = 'unbroken_shipments_cache';
const PENDING_UPDATES_QUEUE_KEY = 'unbroken_pending_updates_queue';

type PendingUpdate = {
    shipmentId: string;
    updates: Partial<Omit<Shipment, 'id' | '_id' | '_rev'>>;
};

/**
 * Fetches all shipment documents, from API or local cache.
 * @returns A promise that resolves to an object containing the shipments array and an isOnline status.
 */
export async function fetchAllShipments(): Promise<FetchShipmentsResult> {
    const API_URL = '/api/couchbase/_all_docs?include_docs=true&limit=500';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    try {
        console.log("Attempting to fetch live data from API...");
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${basicAuth}`,
            },
        });

        if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

        const json = await response.json();
        if (!json.rows) throw new Error('API response is missing the "rows" property.');

        const shipments: Shipment[] = json.rows
            .filter((row: any) => row.doc && row.doc.shipment_id)
            .map((row: any) => ({
                id: row.id,
                ...row.doc,
            }));
        
        localStorage.setItem(SHIPMENTS_CACHE_KEY, JSON.stringify(shipments));
        console.log(`Successfully fetched and cached ${shipments.length} live shipments.`);
        return { shipments, isOnline: true };

    } catch (error: any) {
        console.error("Failed to fetch live data, falling back to cache.", error.message);
        const cachedShipments = localStorage.getItem(SHIPMENTS_CACHE_KEY);
        const shipments = cachedShipments ? JSON.parse(cachedShipments) : [];
        return { shipments, isOnline: false };
    }
}


/**
 * Updates a shipment. If online, it sends the update to the server. 
 * If offline, it queues the update for later syncing.
 * @param shipment The current shipment object.
 * @param updates An object containing the fields to update.
 * @returns A promise resolving to a success/failure object, including the optimistically updated shipment.
 */
export async function updateShipment(
  shipment: Shipment,
  updates: Partial<Omit<Shipment, 'id'>>
): Promise<{ success: boolean; message: string; updatedShipment?: Shipment }> {
    const API_URL_BASE = '/api/couchbase/';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    if (!shipment?._rev) {
        return { success: false, message: 'Document is missing a revision number.' };
    }
    
    const { id, ...doc } = shipment;
    const updatedDoc = { ...doc, ...updates, timestamp: new Date().toISOString() };

    const fullUrl = `${API_URL_BASE}${shipment.id}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDoc),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.reason || `API PUT failed with status ${response.status}`);
        
        return {
            success: true,
            message: 'Shipment updated successfully!',
            updatedShipment: { ...updatedDoc, id: result.id, _id: result.id, _rev: result.rev },
        };
    } catch (error: any) {
        console.error('Failed to update shipment live:', error.message);
        queueUpdateForSync(shipment.id, updatedDoc);
        return { 
            success: true, 
            message: 'You are offline. Update has been queued.', 
            updatedShipment: { ...updatedDoc, id: shipment.id } 
        };
    }
}


function queueUpdateForSync(shipmentId: string, updates: Partial<Omit<Shipment, 'id'>>) {
    const queue: PendingUpdate[] = JSON.parse(localStorage.getItem(PENDING_UPDATES_QUEUE_KEY) || '[]');
    // Remove sensitive fields that shouldn't be in the update payload
    const { _id, _rev, id, ...updatePayload } = updates;
    queue.push({ shipmentId, updates: updatePayload });
    localStorage.setItem(PENDING_UPDATES_QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingUpdateCount(): number {
    const queue = localStorage.getItem(PENDING_UPDATES_QUEUE_KEY);
    return queue ? JSON.parse(queue).length : 0;
}

async function apiUpdateShipmentLive(
  shipment: Shipment,
  updates: Partial<Omit<Shipment, 'id'>>
): Promise<{ success: boolean; message: string; updatedShipment?: Shipment }> {
    const API_URL_BASE = '/api/couchbase/';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    if (!shipment?._rev) {
        return { success: false, message: 'Document is missing a revision number.' };
    }
    
    const { id, ...doc } = shipment;
    const updatedDoc = { ...doc, ...updates, timestamp: new Date().toISOString() };

    const fullUrl = `${API_URL_BASE}${shipment.id}`;

    try {
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDoc),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.reason || `API PUT failed with status ${response.status}`);
        
        return {
            success: true,
            message: 'Shipment updated successfully!',
            updatedShipment: { ...updatedDoc, id: result.id, _id: result.id, _rev: result.rev },
        };
    } catch (error: any) {
        console.error('Failed to update shipment live:', error.message);
        return { success: false, message: error.message };
    }
}

export async function syncPendingUpdates(): Promise<{ success: boolean; message: string }> {
    const queue: PendingUpdate[] = JSON.parse(localStorage.getItem(PENDING_UPDATES_QUEUE_KEY) || '[]');
    if (queue.length === 0) {
        return { success: true, message: "No pending updates to sync." };
    }

    console.log(`Starting sync for ${queue.length} items.`);
    
    // Fetch fresh data to get latest revisions
    const freshData = await fetchAllShipments();
    if (!freshData.isOnline) {
        return { success: false, message: "Cannot sync while offline." };
    }

    let successfulSyncs = 0;
    const remainingUpdates: PendingUpdate[] = [];

    for (const pending of queue) {
        const shipmentToUpdate = freshData.shipments.find(s => s.id === pending.shipmentId);
        if (!shipmentToUpdate) {
            console.warn(`Cannot find shipment ${pending.shipmentId} for sync. Skipping.`);
            continue;
        }

        const result = await apiUpdateShipmentLive(shipmentToUpdate, pending.updates);
        if (result.success) {
            successfulSyncs++;
        } else {
            remainingUpdates.push(pending);
        }
    }

    localStorage.setItem(PENDING_UPDATES_QUEUE_KEY, JSON.stringify(remainingUpdates));

    if (successfulSyncs > 0) {
       await fetchAllShipments(); // Recache latest data
    }
    
    const message = `Synced ${successfulSyncs} of ${queue.length} updates. ${remainingUpdates.length} failed.`;
    return { success: remainingUpdates.length === 0, message };
}
