
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
    const API_URL = 'https://cors-anywhere.herokuapp.com/https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/_all_docs?include_docs=true';
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
    const isOnline = navigator.onLine;

    // Optimistically update the local cache
    const cachedData = localStorage.getItem(SHIPMENTS_CACHE_KEY);
    const shipments: Shipment[] = cachedData ? JSON.parse(cachedData) : [];
    const updatedShipment = { ...shipment, ...updates, timestamp: new Date().toISOString() };
    const newShipments = shipments.map(s => s.id === shipment.id ? updatedShipment : s);
    localStorage.setItem(SHIPMENTS_CACHE_KEY, JSON.stringify(newShipments));

    if (isOnline) {
        // Try to update live
        const result = await apiUpdateShipmentLive(shipment, updates);
        if (!result.success) {
            // If live update fails, queue it for later
            queueUpdateForSync(shipment.id, updates);
            return { ...result, message: `Live update failed: ${result.message}. Update queued.` };
        }
        // Success, refresh the cache with the server's response
        const finalShipments = shipments.map(s => s.id === result.updatedShipment!.id ? result.updatedShipment! : s);
        localStorage.setItem(SHIPMENTS_CACHE_KEY, JSON.stringify(finalShipments));
        return { ...result, updatedShipment: result.updatedShipment };
    } else {
        // Offline, just queue the update
        queueUpdateForSync(shipment.id, updates);
        return { 
            success: true, 
            message: "Offline. Update has been saved and will sync later.",
            updatedShipment
        };
    }
}

// The actual API call to update a document
async function apiUpdateShipmentLive(shipment: Shipment, updates: Partial<Omit<Shipment, 'id'>>) {
    const API_URL_BASE = 'https://cors-anywhere.herokuapp.com/https://j6i1elyshnwlu6jo.apps.cloud.couchbase.com:4984/unbroken-ep.scp.logistics/';
    const basicAuth = 'Y2hhb3NfY29kZXJfMDE6VWskN1FrV3E3VTJ5aUhD';

    if (!shipment?._rev) {
        return { success: false, message: 'Document is missing a revision number.' };
    }
    
    const { id, ...doc } = shipment;
    const updatedDoc = { ...doc, ...updates, timestamp: new Date().toISOString() };

    try {
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
