"use client";

import { useAuth } from '@/hooks/use-auth';
import DashboardHeader from '@/components/dashboard/header';
import DriverDashboard from '@/components/dashboard/driver-dashboard';
import DockWorkerDashboard from '@/components/dashboard/dock-worker-dashboard';
import WarehouseManagerDashboard from '@/components/dashboard/warehouse-manager-dashboard';

export default function DashboardPage() {
    const { user } = useAuth();

    const renderDashboardByRole = () => {
        switch (user?.role) {
            case 'Driver':
                return <DriverDashboard />;
            case 'Dock Worker':
                return <DockWorkerDashboard />;
            case 'Warehouse Manager':
                return <WarehouseManagerDashboard />;
            default:
                // This can be a fallback or a loading state
                return <p>Loading dashboard...</p>;
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card shadow-2xl">
                 <DashboardHeader />
                <div className="p-6">
                    {renderDashboardByRole()}
                </div>
            </div>
        </main>
    );
}
