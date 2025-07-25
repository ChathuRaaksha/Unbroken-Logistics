
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Truck, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getPendingUpdateCount, syncPendingUpdates } from '@/services/logistics-api';
import { useToast } from '@/hooks/use-toast';


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, isOnline, setLastSyncTime } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // This check ensures localStorage is only accessed on the client side.
    if (typeof window !== 'undefined') {
        setPendingCount(getPendingUpdateCount());
    }
    
    const handleSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      toast({ title: 'Syncing...', description: 'Attempting to sync offline updates.' });
      const result = await syncPendingUpdates();
      if (result.success) {
        toast({ title: 'Sync Complete', description: result.message });
        setLastSyncTime(Date.now());
      } else {
        toast({ variant: 'destructive', title: 'Sync Failed', description: result.message });
      }
      setPendingCount(getPendingUpdateCount());
      setIsSyncing(false);
    };

    const handleOnline = () => {
      if (getPendingUpdateCount() > 0) {
        handleSync();
      }
    };

    window.addEventListener('online', handleOnline);

    // Initial sync check on load
    if (typeof window !== "undefined" && navigator.onLine && getPendingUpdateCount() > 0) {
      handleSync();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [toast, isSyncing, setLastSyncTime]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-4">
             <Skeleton className="h-9 w-24" />
             <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const managerAvatarUrl = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2940&auto=format&fit=crop';
  const avatarSrc = user.role === 'Warehouse Staff' ? managerAvatarUrl : `https://i.pravatar.cc/150?u=${user?.username}`;


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-headline">Unbroken Logistics</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
            {pendingCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1.5 whitespace-nowrap">
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {pendingCount} Pending
                </Badge>
            )}
            <Badge variant={isOnline ? 'secondary' : 'destructive'} className="flex items-center gap-1.5 whitespace-nowrap">
              {isOnline ? <Wifi className="h-4 w-4"/> : <WifiOff className="h-4 w-4"/>}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <div className="flex flex-col text-sm text-right overflow-hidden">
              <span className="font-semibold truncate">{user.username}</span>
              <span className="text-xs text-muted-foreground truncate">{user.role}</span>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarSrc} alt={user.username} />
              <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
            </Avatar>
             <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
             </Button>
          </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
