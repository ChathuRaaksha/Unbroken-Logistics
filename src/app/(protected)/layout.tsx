'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LogOut, Home, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 p-4 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex-1 space-y-2 pt-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
            </div>
            <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-6 md:p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Driver', 'Dock Worker', 'Warehouse Manager'] },
  ];

  return (
    <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <h1 className="font-headline text-lg font-semibold">
                Unbroken
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.filter(item => item.roles.includes(user.role)).map(item => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.username}`} />
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm overflow-hidden">
                  <span className="font-semibold truncate">{user.username}</span>
                  <span className="text-muted-foreground truncate">{user.role}</span>
                </div>
                 <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0" onClick={logout}>
                  <LogOut />
                 </Button>
              </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4 sm:p-6">
          <header className="mb-6 flex items-center">
            <SidebarTrigger className="md:hidden mr-4" />
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          </header>
          {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
