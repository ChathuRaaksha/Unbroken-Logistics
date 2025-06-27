"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Wifi } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = React.useState(true); // Mock state for now

  // In a real app, you'd use a service to check connectivity
  // React.useEffect(() => { ... });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="flex items-start justify-between p-4 border-b bg-primary/5 rounded-t-2xl">
      <div className="flex items-center gap-4">
        <Avatar>
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.username}`} />
            <AvatarFallback>{user?.username ? getInitials(user.username) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="font-headline text-lg font-semibold text-primary">
                Hello, {user?.username}!
            </h1>
            <p className="text-sm text-muted-foreground">Your role: <span className="font-bold">{user?.role}</span></p>
             <Badge variant={isOnline ? "secondary" : "destructive"} className="mt-2 text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                {isOnline ? "Online" : "Offline"}
            </Badge>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
        <LogOut className="h-5 w-5 text-muted-foreground" />
      </Button>
    </header>
  );
}
