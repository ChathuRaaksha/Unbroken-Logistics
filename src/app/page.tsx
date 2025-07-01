"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        router.push('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-2xl">
        <Card className="border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Truck className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">Unbroken Logistics</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., driver_01"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
             <Accordion type="single" collapsible className="w-full mt-6">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline justify-center">
                  Need credentials to test?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2 pt-4 mt-2 border-t">
                    <p className="font-semibold text-foreground">Log in with one of the following:</p>
                    <p>• <strong>Driver:</strong> driver_01 / pass123</p>
                    <p>• <strong>Dock Worker:</strong> dock_01 / pass123</p>
                    <p>• <strong>Warehouse Manager:</strong> manager_01 / pass123</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
