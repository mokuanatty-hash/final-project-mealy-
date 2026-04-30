import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, User, CheckCircle } from "lucide-react";
import axios from "axios";

interface AuthFormProps {
  onAuthSuccess: (userType: 'customer' | 'admin') => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signupType, setSignupType] = useState<'customer' | 'admin'>('customer');
  const [createdAccount, setCreatedAccount] = useState<{username: string, type: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent, userType: 'customer' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    
    if (!username || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("Login API_URL:", API_URL);
      console.log("Login data:", { username, password, userType });
      const res = await axios.post(`${API_URL}/api/auth`, {
        username,
        password
      });
      console.log("Login response:", res.data);
      setIsLoading(false);
      
      // Check if the user type matches what we expect
      if (res.data.type === userType) {
        console.log(`Login successful as ${userType}`);
        onAuthSuccess(userType);
      } else {
        console.log(`Expected ${userType} but got ${res.data.type}`);
        setError(`This account is a ${res.data.type} account. Please use the correct login button.`);
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Invalid username or password");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get("username-signup") as string;
    const password = formData.get("password-signup") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    if (password.length < 3) {
      setError("Password must be at least 3 characters long");
      setIsLoading(false);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("API_URL:", API_URL);
      console.log("Signup data:", { username, password, type: signupType });
      const res = await axios.post(`${API_URL}/api/signup`, {
        username,
        password,
        type: signupType
      });
      console.log("Signup response:", res.data);
      setIsLoading(false);
      setSuccess(`Account created successfully! You can now sign in as ${signupType}.`);
      setCreatedAccount({ username, type: signupType });
      // Clear the form
      form.reset();
      setSignupType('customer');
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError("Username already exists");
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Signup failed. Please try again.");
        }
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  const handleSwitchToLogin = () => {
    setError(null);
    setSuccess(null);
    setCreatedAccount(null);
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
          {error && <div className="text-red-500 text-sm mb-2 bg-red-50 p-2 rounded">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2 bg-green-50 p-2 rounded flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {success}
          </div>}
          {createdAccount && (
            <div className="text-blue-600 text-sm mb-2 bg-blue-50 p-2 rounded">
              <strong>Account Created:</strong> {createdAccount.username} ({createdAccount.type})
              <br />
              <small>You can now sign in with these credentials.</small>
            </div>
          )}
          
          <Tabs defaultValue="login" className="w-full" onValueChange={handleSwitchToLogin}>
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
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      const form = document.getElementById('login-form') as HTMLFormElement;
                      const formData = new FormData(form);
                      const username = formData.get("username") as string;
                      const password = formData.get("password") as string;
                      
                      if (!username || !password) {
                        setError("Please fill in all fields");
                        return;
                      }
                      
                      setIsLoading(true);
                      setError(null);
                      setSuccess(null);
                      
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                        console.log("Admin Login API_URL:", API_URL);
                        console.log("Admin Login data:", { username, password, userType: 'admin' });
                        const res = await axios.post(`${API_URL}/api/auth`, {
                          username,
                          password
                        });
                        console.log("Admin Login response:", res.data);
                        setIsLoading(false);
                        
                        if (res.data.type === 'admin') {
                          console.log("Admin login successful");
                          onAuthSuccess('admin');
                        } else {
                          console.log(`Expected admin but got ${res.data.type}`);
                          setError(`This account is a ${res.data.type} account. Please use the Customer login button.`);
                        }
                      } catch (err: unknown) {
                        console.error("Admin Login error:", err);
                        setIsLoading(false);
                        if (axios.isAxiosError(err)) {
                          if (err.response?.status === 401) {
                            setError("Invalid username or password");
                          } else {
                            setError("Login failed. Please try again.");
                          }
                        } else {
                          setError("Login failed. Please try again.");
                        }
                      }
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
                  <Input id="username-signup" name="username-signup" type="text" placeholder="Enter your username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" name="password-signup" type="password" placeholder="Enter your password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm your password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-signup">Account Type</Label>
                  <select 
                    id="type-signup" 
                    name="type-signup" 
                    value={signupType} 
                    onChange={e => setSignupType(e.target.value as 'customer' | 'admin')} 
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="customer">Customer - Order meals and track deliveries</option>
                    <option value="admin">Admin - Manage menu and view orders</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {signupType === 'customer' 
                      ? "Customers can browse meals, place orders, and track deliveries." 
                      : "Admins can manage the menu, view all orders, and manage the restaurant."
                    }
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Button 
                    type="submit" 
                    className={`w-full transition-all ${
                      signupType === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' 
                        : 'bg-gradient-to-r from-appetizing to-warm hover:opacity-90'
                    }`}
                    disabled={isLoading}
                  >
                    {signupType === 'admin' ? (
                      <ChefHat className="w-4 h-4 mr-2" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Creating account..." : `Sign up as ${signupType}`}
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
