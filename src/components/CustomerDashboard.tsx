import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Clock, Star, ShoppingCart, User, LogOut, Package, Calendar, MapPin } from "lucide-react";
import heroMeal from "@/assets/hero-meal.jpg";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface CustomerDashboardProps {
  onLogout: () => void;
}

// Mock data for today's menu
const todaysMenu = [
  {
    id: 1,
    name: "Grilled Chicken Bowl",
    description: "Grilled chicken breast with quinoa, roasted vegetables, and herb sauce",
    price: 15.99,
    category: "Protein Bowl",
    rating: 4.8,
    cookTime: "25 min"
  },
  {
    id: 2,
    name: "Mediterranean Salmon",
    description: "Pan-seared salmon with couscous, cucumber salad, and tzatziki",
    price: 18.99,
    category: "Seafood",
    rating: 4.9,
    cookTime: "30 min"
  },
  {
    id: 3,
    name: "Veggie Power Bowl",
    description: "Roasted sweet potato, chickpeas, avocado, and tahini dressing",
    price: 13.99,
    category: "Vegetarian",
    rating: 4.7,
    cookTime: "20 min"
  },
  {
    id: 4,
    name: "BBQ Beef Brisket",
    description: "Slow-cooked beef brisket with mashed potatoes and coleslaw",
    price: 19.99,
    category: "BBQ",
    rating: 4.6,
    cookTime: "35 min"
  }
];

export function CustomerDashboard({ onLogout }: CustomerDashboardProps) {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [meals, setMeals] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaStatus, setMpesaStatus] = useState<string | null>(null);
  const [myOrders, setMyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  
  // Delivery details state
  const [deliveryDetails, setDeliveryDetails] = useState({
    location: "",
    houseNumber: "",
    phoneNumber: "",
    additionalNotes: ""
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    axios.get(`${API_URL}/api/meals`).then(res => setMeals(res.data));
    // Load customer orders (using a default customer name for demo)
    axios.get(`${API_URL}/api/orders/customer/Customer`).then(res => setMyOrders(res.data));
  }, []);

  // Refresh customer orders every 30 seconds to see status updates
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API_URL}/api/orders/customer/Customer`).then(res => setMyOrders(res.data));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [API_URL]);

  // Get unique categories from meals
  const categories = ["All", ...new Set(meals.map((meal: any) => meal.category))];

  // Filter meals by selected category
  const filteredMeals = selectedCategory === "All" 
    ? meals 
    : meals.filter((meal: any) => meal.category === selectedCategory);

  const handleOrderMeal = async (mealId: number, mealName: string) => {
    if (!deliveryDate || !deliveryTime) {
      toast({
        title: "Missing Info",
        description: "Please select delivery date and time.",
        variant: "destructive"
      });
      return;
    }
    
    if (!deliveryDetails.location || !deliveryDetails.houseNumber || !deliveryDetails.phoneNumber) {
      toast({
        title: "Missing Delivery Details",
        description: "Please fill in location, house number, and phone number.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/orders`, {
        customerName: "Customer", // You can replace with actual user info if available
        meal: mealName,
        price: meals.find((m: any) => m.id === mealId)?.price || 0,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_location: deliveryDetails.location,
        delivery_house_number: deliveryDetails.houseNumber,
        delivery_phone: deliveryDetails.phoneNumber,
        delivery_notes: deliveryDetails.additionalNotes
      });
      setSelectedMeal(mealId);
      setOrderPlaced(true);
      // Refresh orders after placing new order
      axios.get(`${API_URL}/api/orders/customer/Customer`).then(res => setMyOrders(res.data));
      toast({
        title: "Order Placed! 🎉",
        description: `Your order for ${mealName} has been confirmed.`,
      });
    } catch (err) {
      toast({
        title: "Order Failed",
        description: "Could not place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangeOrder = () => {
    setSelectedMeal(null);
    setOrderPlaced(false);
    toast({
      title: "Order Updated",
      description: "You can now select a different meal.",
    });
  };

  const handleMpesaPay = async () => {
    setMpesaStatus(null);
    try {
      const res = await axios.post(`${API_URL}/api/mpesa/stkpush`, {
        phone: mpesaPhone,
        amount: meals.find((m: any) => m.id === selectedMeal)?.price || 1
      });
      if (res.data.ResponseCode === "0") {
        setMpesaStatus("Payment prompt sent to your phone. Complete payment on your device.");
      } else {
        setMpesaStatus(res.data.errorMessage || "Failed to initiate payment.");
      }
    } catch (err: any) {
      setMpesaStatus(err.response?.data?.error || "Failed to initiate payment.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">Welcome back 😉</h1>
              <p className="text-orange-100">Ready for today's delicious meal?</p>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-orange-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img 
            src={heroMeal} 
            alt="Today's Special" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
            <div className="text-white p-8">
              <h2 className="text-4xl font-bold mb-2">Today's Menu</h2>
              <p className="text-xl">Fresh, delicious meals prepared with love</p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Menu & Order</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            {/* Delivery Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                Delivery Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Area *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Westlands, Kilimani, CBD"
                    value={deliveryDetails.location}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House/Apartment Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., House 15, Apt 3B, Room 204"
                    value={deliveryDetails.houseNumber}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, houseNumber: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={deliveryDetails.phoneNumber}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, phoneNumber: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="e.g., Near the gate, Call when arriving, Security code: 1234"
                    value={deliveryDetails.additionalNotes}
                    onChange={(e) => setDeliveryDetails({...deliveryDetails, additionalNotes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-sm">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.map((meal: any) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{meal.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {meal.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          Ksh {meal.price}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{meal.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {meal.cookTime}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {meal.rating}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOrderMeal(meal.id, meal.name)}
                        disabled={selectedMeal === meal.id}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {selectedMeal === meal.id ? "Ordered" : "Order Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                My Orders
              </h3>
              
              {/* Delivery Details Summary */}
              {myOrders.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Your Delivery Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Most Recent Location:</span>
                      <p className="text-green-600">
                        {myOrders[myOrders.length - 1]?.delivery_location || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Contact Phone:</span>
                      <p className="text-green-600">
                        {myOrders[myOrders.length - 1]?.delivery_phone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">House/Apartment:</span>
                      <p className="text-green-600">
                        {myOrders[myOrders.length - 1]?.delivery_house_number || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {myOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No orders yet</h4>
                  <p className="text-gray-500">Place your first order from the menu!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order: any) => (
                    <Card key={order.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold">{order.meal}</h4>
                            <p className="text-gray-600">Order #{order.id}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">
                              Ksh {order.price}
                            </div>
                            <Badge className={`mt-2 ${getStatusColor(order.status || 'pending')}`}>
                              {order.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Ordered at {order.time}</span>
                          </div>
                          {order.delivery_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Delivery: {order.delivery_date}</span>
                            </div>
                          )}
                          {order.delivery_time && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>Time: {order.delivery_time}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Delivery Details Section */}
                        {(order.delivery_location || order.delivery_house_number || order.delivery_phone) && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Delivery Information
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                                  <div>
                                    <span className="font-medium text-blue-800">House/Apartment:</span>
                                    <p className="text-blue-700">{order.delivery_house_number}</p>
                                  </div>
                                </div>
                              )}
                              {order.delivery_phone && (
                                <div className="flex items-start">
                                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                                  <div>
                                    <span className="font-medium text-blue-800">Contact Phone:</span>
                                    <p className="text-blue-700">{order.delivery_phone}</p>
                                  </div>
                                </div>
                              )}
                              {order.delivery_notes && (
                                <div className="flex items-start md:col-span-2">
                                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                                  <div>
                                    <span className="font-medium text-blue-800">Special Instructions:</span>
                                    <p className="text-blue-700">{order.delivery_notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Confirmation */}
        {orderPlaced && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-center text-green-600">
                  Order Confirmed! 🎉
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4">
                  Your order has been placed successfully. We'll deliver it to you at the specified time.
                </p>
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Enter M-Pesa phone number"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleMpesaPay}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!mpesaPhone}
                  >
                    Pay with M-Pesa
                  </Button>
                  {mpesaStatus && <div className="text-sm mt-2 text-orange-600">{mpesaStatus}</div>}
                  <Button 
                    onClick={handleChangeOrder}
                    variant="outline" 
                    className="w-full"
                  >
                    Change Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}