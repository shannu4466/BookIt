
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { hashPassword } from "@/utils/crypto";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const hashedPassword = await hashPassword(password);

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', trimmedEmail)
        .eq('password_hash', hashedPassword)
        .single();

      if (error || !data) {

        // Check if they are in the pending admin_requests table instead
        const { data: requestData, error: requestError } = await supabase
          .from('admin_requests')
          .select('*')
          .eq('email', trimmedEmail)
          .eq('password_hash', hashedPassword)
          .single();

        if (requestData) {
          if (requestData.status === 'pending') {
            toast({
              title: "Approval Pending",
              description: "Your partner registration is waiting for super admin approval.",
            });
          } else if (requestData.status === 'rejected') {
            toast({
              title: "Request Rejected",
              description: "Your partner registration was rejected by the super admin.",
              variant: "destructive"
            });
          } else {
            // In case they are somehow 'approved' but didn't make it to admin_users table
            toast({
              title: "Error",
              description: "Invalid credentials",
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // If we made it here, data exists and passwords matched (via eq clause)
      localStorage.setItem('adminUser', JSON.stringify(data));
      toast({
        title: "Success",
        description: "Welcome to admin dashboard!",
      });
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-purple-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                placeholder="admin@bookit.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 pr-10"
                  placeholder="Enter password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-white hover:text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
