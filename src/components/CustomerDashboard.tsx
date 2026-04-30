import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, Star, ShoppingCart, User, LogOut } from "lucide-react";
import heroMeal from "@/assets/hero-meal.jpg";
import axios from "axios";

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

  useEffect(() => {
    axios.get("http://localhost:5000/api/meals").then(res => setMeals(res.data));
  }, []);

  const handleOrderMeal = async (mealId: number, mealName: string) => {
    if (!deliveryDate || !deliveryTime) {
      toast({
        title: "Missing Info",
        description: "Please select delivery date and time.",
        variant: "destructive"
      });
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/orders", {
        customerName: "Customer", // You can replace with actual user info if available
        meal: mealName,
        price: meals.find((m: any) => m.id === mealId)?.price || 0,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime
      });
      setSelectedMeal(mealId);
      setOrderPlaced(true);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-appetizing to-warm text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome back, John!</h1>
                <p className="text-white/80 text-sm">Ready for today's delicious meal?</p>
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
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-elevated">
          <img 
            src={heroMeal} 
            alt="Today's Featured Meal" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="text-white p-6">
              <h2 className="text-2xl font-bold mb-2">Today's Menu</h2>
              <p className="text-white/90">Fresh, delicious meals prepared with love</p>
            </div>
          </div>
        </div>

        {/* Delivery Date/Time Form */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div>
            <label className="block mb-1 font-medium">Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Delivery Time</label>
            <input type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="border rounded px-2 py-1" />
          </div>
        </div>

        {/* Order Status */}
        {orderPlaced && selectedMeal && (
          <Card className="mb-8 border-fresh bg-fresh/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-fresh rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-fresh">Order Confirmed!</h3>
                    <p className="text-sm text-muted-foreground">
                      {todaysMenu.find(meal => meal.id === selectedMeal)?.name}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleChangeOrder}
                  className="border-fresh text-fresh hover:bg-fresh hover:text-white"
                >
                  Change Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meals.map((meal) => (
            <Card 
              key={meal.id} 
              className={`transition-all duration-200 hover:shadow-appetizing ${
                selectedMeal === meal.id ? 'ring-2 ring-appetizing shadow-appetizing' : 'shadow-card hover:shadow-elevated'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{meal.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {meal.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-appetizing">
                      Ksh {meal.price}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {meal.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-warm text-warm" />
                    <span>{meal.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{meal.cookTime}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-appetizing to-warm hover:opacity-90 transition-opacity"
                  onClick={() => handleOrderMeal(meal.id, meal.name)}
                  disabled={orderPlaced && selectedMeal !== meal.id}
                >
                  {selectedMeal === meal.id ? 'Selected' : 'Order This Meal'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}