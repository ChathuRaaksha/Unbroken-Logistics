
import type { Shipment } from '@/services/logistics-api';

export const mockShipments: Shipment[] = [
    { id: '1', destination: 'Jevremovac', handler_role: 'warehouse_staff', handoff_point: 'warehouse', item_id: '73', origin: 'Pasarkayu', package_condition: 'damaged', rfid: '494D8SCTNM', shipment_id: '73', status: 'delayed', timestamp: '1/27/2025' },
    { id: '2', destination: 'Roseau', handler_role: 'warehouse_staff', handoff_point: 'warehouse', item_id: '672', origin: 'Aykhal', package_condition: 'damaged', rfid: 'I5Y98PTX06', shipment_id: '672', status: 'delivered', timestamp: '11/3/2024' },
    { id: '3', destination: 'Pueblo', handler_role: 'driver', handoff_point: 'truck', item_id: '437', origin: 'Blatnica', package_condition: 'intact', rfid: '59U63J786Z', shipment_id: '437', status: 'delivered', timestamp: '8/14/2024' },
    { id: '4', destination: 'Mirzec', handler_role: 'dock_worker', handoff_point: 'warehouse', item_id: '733', origin: 'Akron', package_condition: 'missing', rfid: '0T90T1UO7Z', shipment_id: '733', status: 'in_transit', timestamp: '1/12/2025' },
    { id: '5', destination: 'El Paso', handler_role: 'warehouse_staff', handoff_point: 'warehouse', item_id: '602', origin: 'Belang', package_condition: 'damaged', rfid: '7U8T3352SO', shipment_id: '602', status: 'in_transit', timestamp: '1/30/2025' },
    { id: '6', destination: 'Tarauacá', handler_role: 'dock_worker', handoff_point: 'truck', item_id: '354', origin: 'Shushenskoye', package_condition: 'intact', rfid: '34V015M47I', shipment_id: '354', status: 'in_transit', timestamp: '5/31/2025' },
    { id: '7', destination: 'Monte', handler_role: 'dock_worker', handoff_point: 'customs', item_id: '28', origin: 'Lynchburg', package_condition: 'intact', rfid: 'K1PKK2O638', shipment_id: '28', status: 'delayed', timestamp: '8/29/2024' },
    { id: '8', destination: 'Xiaochuan', handler_role: 'dock_worker', handoff_point: 'port', item_id: '199', origin: 'Cheping', package_condition: 'missing', rfid: 'NTM9CDQ1O1', shipment_id: '199', status: 'picked_up', timestamp: '1/21/2025' },
    { id: '9', destination: 'Pincher Creek', handler_role: 'driver', handoff_point: 'customs', item_id: '875', origin: 'Wuppertal', package_condition: 'damaged', rfid: 'E850OQ572U', shipment_id: '875', status: 'in_transit', timestamp: '1/29/2025' },
    { id: '10', destination: 'Wudong', handler_role: 'driver', handoff_point: 'customs', item_id: '550', origin: 'Cavaillon', package_condition: 'damaged', rfid: 'OKKHW0ET5A', shipment_id: '550', status: 'picked_up', timestamp: '1/22/2025' }
];
