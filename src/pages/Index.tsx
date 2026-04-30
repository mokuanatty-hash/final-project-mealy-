import { useState, useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

const Index = () => {
  const [user, setUser] = useState<{type: 'customer' | 'admin'} | null>(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType === 'customer' || userType === 'admin') {
      setUser({ type: userType });
    }
  }, []);

  const handleAuthSuccess = (userType: 'customer' | 'admin') => {
    setUser({ type: userType });
    localStorage.setItem('userType', userType);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userType');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (user.type === 'customer') {
    return <CustomerDashboard onLogout={handleLogout} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Index;
