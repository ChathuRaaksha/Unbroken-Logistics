"use client";

import { useAuth } from '@/hooks/use-auth';
import DriverDashboard from '@/components/dashboard/driver-dashboard';
import DockWorkerDashboard from '@/components/dashboard/dock-worker-dashboard';
import WarehouseStaffDashboard from '@/components/dashboard/warehouse-manager-dashboard';

export default function DashboardPage() {
    const { user } = useAuth();

    const renderDashboardByRole = () => {
        switch (user?.role) {
            case 'Driver':
                return <DriverDashboard />;
            case 'Dock Worker':
                return <DockWorkerDashboard />;
            case 'Warehouse Staff':
                return <WarehouseStaffDashboard />;
            default:
                // This can be a fallback or a loading state
                return <p>Loading dashboard...</p>;
        }
    };

    return (
        <div>
            <p className="text-muted-foreground mb-6">
                Welcome back, {user?.username}! Here's an overview based on your role as a {user?.role}.
            </p>
            {renderDashboardByRole()}
        </div>
    );
}
