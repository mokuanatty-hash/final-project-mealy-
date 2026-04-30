import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, User } from "lucide-react";
import axios from "axios";

interface AuthFormProps {
  onAuthSuccess: (userType: 'customer' | 'admin') => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupType, setSignupType] = useState<'customer' | 'admin'>('customer');

  const handleSubmit = async (e: React.FormEvent, userType: 'customer' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    try {
      const res = await axios.post("http://localhost:5000/api/auth", {
        username,
        password
      });
      setIsLoading(false);
      if (res.data.type === userType) {
        onAuthSuccess(userType);
      } else {
        setError("Incorrect user type or credentials");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Invalid credentials");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username-signup") as string;
    const password = formData.get("password-signup") as string;
    try {
      const res = await axios.post("http://localhost:5000/api/signup", {
        username,
        password,
        type: signupType
      });
      setIsLoading(false);
      onAuthSuccess(signupType);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-appetizing to-warm rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Mealy</CardTitle>
          <p className="text-muted-foreground">Fresh meals, delivered fresh</p>
        </CardHeader>
        
        <CardContent>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form id="login-form" onSubmit={(e) => handleSubmit(e, 'customer')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" type="text" placeholder="admin or customer" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-3 pt-4 flex flex-col gap-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-appetizing to-warm hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {isLoading ? "Signing in..." : "Sign in as Customer"}
                  </Button>
                  <Button
                    type="submit"
                    form="login-form"
                    onClick={e => {
                      e.preventDefault();
                      handleSubmit(e as any, 'admin');
                    }}
                    variant="outline"
                    className="w-full border-appetizing text-appetizing hover:bg-appetizing hover:text-white"
                    disabled={isLoading}
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    {isLoading ? "Signing in..." : "Sign in as Admin"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username-signup">Username</Label>
                  <Input id="username-signup" name="username-signup" type="text" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" name="password-signup" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-signup">Account Type</Label>
                  <select id="type-signup" name="type-signup" value={signupType} onChange={e => setSignupType(e.target.value as 'customer' | 'admin')} className="w-full border rounded px-2 py-1">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-3 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-appetizing to-warm hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating account..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}