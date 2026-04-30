import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  LogOut,
  Users,
  MapPin,
  Phone,
  Home,
  FileText,
  RefreshCw
} from "lucide-react";
import axios from "axios";

interface AdminDashboardProps {
  onLogout: () => void;
}


const initialMeals = [
  {
    id: 1,
    name: "Grilled Chicken Bowl",
    description: "Grilled chicken breast with quinoa, roasted vegetables, and herb sauce",
    price: 15.99,
    category: "Protein Bowl"
  },
  {
    id: 2,
    name: "Mediterranean Salmon",
    description: "Pan-seared salmon with couscous, cucumber salad, and tzatziki",
    price: 18.99,
    category: "Seafood"
  },
  {
    id: 3,
    name: "Veggie Power Bowl",
    description: "Roasted sweet potato, chickpeas, avocado, and tahini dressing",
    price: 13.99,
    category: "Vegetarian"
  }
];

const todaysOrders = [
  { id: 1, customerName: "John Doe", meal: "Grilled Chicken Bowl", price: 15.99, time: "12:30 PM" },
  { id: 2, customerName: "Jane Smith", meal: "Mediterranean Salmon", price: 18.99, time: "12:35 PM" },
  { id: 3, customerName: "Mike Johnson", meal: "Veggie Power Bowl", price: 13.99, time: "12:40 PM" },
  { id: 4, customerName: "Sarah Wilson", meal: "Grilled Chicken Bowl", price: 15.99, time: "12:45 PM" },
];

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [meals, setMeals] = useState([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });
  const [orders, setOrders] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/meals`).then(res => setMeals(res.data));
    axios.get(`${API_URL}/api/orders`).then(res => setOrders(res.data));
  }, []);

  // Refresh orders every 30 seconds to keep admin dashboard current
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API_URL}/api/orders`).then(res => setOrders(res.data));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [API_URL]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);

  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/meals`, {
        name: newMeal.name,
        description: newMeal.description,
        price: newMeal.price,
        category: newMeal.category
      });
      setMeals([...meals, res.data]);
      setNewMeal({ name: "", description: "", price: "", category: "" });
      setIsAddingMeal(false);
      toast({
        title: "Meal Added! 🍽️",
        description: `${res.data.name} has been added to your menu.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add meal.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMeal = (id: number, name: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
    toast({
      title: "Meal Removed",
      description: `${name} has been removed from your menu.`,
    });
  };

  const handleMarkAsDelivered = async (orderId: number, customerName: string) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: "delivered"
      });
      
      // Update the orders state
      setOrders(orders.map((order: any) => 
        order.id === orderId 
          ? { ...order, status: "delivered" }
          : order
      ));
      
      toast({
        title: "Order Delivered! ✅",
        description: `${customerName}'s order has been marked as delivered.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-appetizing to-warm text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mealy Admin Dashboard</h1>
                <p className="text-white/80 text-sm">Manage your menu and track orders</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-appetizing/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-appetizing" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold text-appetizing">Ksh {totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-fresh/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-fresh" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orders Today</p>
                  <p className="text-2xl font-bold text-fresh">{todaysOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-warm/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-warm" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                  <p className="text-2xl font-bold text-warm">{meals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Today's Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Menu Items</span>
                  </CardTitle>
                  <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-appetizing to-warm hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Meal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Meal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Meal Name *</Label>
                          <Input
                            id="name"
                            value={newMeal.name}
                            onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                            placeholder="e.g., Grilled Chicken Bowl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newMeal.description}
                            onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
                            placeholder="Describe the meal..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newMeal.price}
                            onChange={(e) => setNewMeal({...newMeal, price: e.target.value})}
                            placeholder="15.99"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newMeal.category}
                            onChange={(e) => setNewMeal({...newMeal, category: e.target.value})}
                            placeholder="e.g., Protein Bowl, Vegetarian"
                          />
                        </div>
                        <Button 
                          onClick={handleAddMeal} 
                          className="w-full bg-gradient-to-r from-appetizing to-warm hover:opacity-90"
                        >
                          Add Meal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{meal.name}</h3>
                          <Badge variant="outline">{meal.category}</Badge>
                          <span className="text-lg font-bold text-appetizing">Ksh {meal.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{meal.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id, meal.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Today's Orders</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => axios.get(`${API_URL}/api/orders`).then(res => setOrders(res.data))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Delivery Summary */}
                {orders.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Delivery Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Total Orders:</span>
                        <p className="text-blue-600 font-bold">{orders.length}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">With Delivery Details:</span>
                        <p className="text-blue-600 font-bold">
                          {orders.filter((order: any) => order.delivery_location || order.delivery_phone).length}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Pending Delivery:</span>
                        <p className="text-blue-600 font-bold">
                          {orders.filter((order: any) => order.status === 'pending').length}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Average Order Value:</span>
                        <p className="text-blue-600 font-bold">
                          Ksh {(totalRevenue / orders.length).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h3 className="font-medium">{order.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{order.meal}</p>
                          {order.delivery_date && order.delivery_time && (
                            <p className="text-xs text-muted-foreground">Delivery: {order.delivery_date} at {order.delivery_time}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-appetizing">Ksh {order.price}</p>
                          <p className="text-sm text-muted-foreground">{order.time}</p>
                          <Badge className="mt-1" variant="outline">
                            {order.status || 'pending'}
                          </Badge>
                          {(order.status === 'pending' || order.status === 'preparing' || order.status === 'delivering') && (
                            <Button
                              onClick={() => handleMarkAsDelivered(order.id, order.customerName)}
                              size="sm"
                              className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery Details */}
                      {(order.delivery_location || order.delivery_house_number || order.delivery_phone) && (
                        <div className="p-4 border-t bg-white">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            Delivery Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {order.delivery_location && (
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                                <div>
                                  <span className="font-medium text-blue-800">Location:</span>
                                  <p className="text-blue-700">{order.delivery_location}</p>
                                </div>
                              </div>
                            )}
                            {order.delivery_house_number && (
                              <div className="flex items-start">
                                <Home className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                                <div>
                                  <span className="font-medium text-green-800">House/Apartment:</span>
                                  <p className="text-green-700">{order.delivery_house_number}</p>
                                </div>
                              </div>
                            )}
                            {order.delivery_phone && (
                              <div className="flex items-start">
                                <Phone className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                                <div>
                                  <span className="font-medium text-purple-800">Contact Phone:</span>
                                  <p className="text-purple-700">{order.delivery_phone}</p>
                                </div>
                              </div>
                            )}
                            {order.delivery_notes && (
                              <div className="flex items-start md:col-span-2">
                                <FileText className="w-4 h-4 mr-2 mt-0.5 text-orange-600" />
                                <div>
                                  <span className="font-medium text-orange-800">Special Instructions:</span>
                                  <p className="text-orange-700">{order.delivery_notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Revenue:</span>
                    <span className="text-2xl font-bold text-appetizing">Ksh {totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
