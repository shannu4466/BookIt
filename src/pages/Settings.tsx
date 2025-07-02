
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Bell, Shield, Palette, Lock, LogOut, HelpCircle, Share2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import MobileNavigation from "@/components/MobileNavigation";
import { profile } from "console";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updatePassword, signOut, updateUserProfile } = useAuth();
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const storedSettings = JSON.parse(localStorage.getItem("userSettings") || "{}");
  const [notifications, setNotifications] = useState(
    storedSettings.notifications ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    storedSettings.emailNotifications ?? true
  );
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("userSettings");
    return saved ? JSON.parse(saved).language || "en" : "en";
  });

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem("userSettings");
    return saved ? JSON.parse(saved).currency || "INR" : "INR";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editUserName, setEditUserName] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUpdatePassword, setEditUpdatePassword] = useState(false)

  // Load settings from localStorage and user profile data
  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.language) setLanguage(parsed.language);
      if (parsed.currency) setCurrency(parsed.currency);
      if (parsed.notifications !== undefined) setNotifications(parsed.notifications);
      if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications);
    }
  }, []);


  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        setUserName(data.name || '');
        setUserPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveSettingsToLocalStorage = () => {
    const settings = {
      notifications,
      emailNotifications,
      language,
      currency,
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save settings to localStorage
      saveSettingsToLocalStorage();

      // Update user profile in user_profiles table
      if (user?.id) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            name: userName,
            phone: userPhone
          });

        if (error) {
          toast.error("Failed to update profile: " + error.message);
          return;
        }
      }

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUpdatePassword(false);

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsPasswordLoading(true);
    const result = await updatePassword(newPassword);
    if (!result.error) {
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsPasswordLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!editUserName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (editUserPhone.trim().length !== 10) {
      toast.error("Mobile number must exactly 10 digits");
      return;
    }

    setIsProfileLoading(true); // loading state for the update
    const result = await updateUserProfile(editUserName.trim(), editUserPhone.trim());

    if (!result.error) {
      setUserName(editUserName.trim()); // Update real state
      setUserPhone(editUserPhone.trim());
      toast.success("Profile updated!");
      setEditProfile(false); // Exit edit mode
    }

    setIsProfileLoading(false);
  };

  const handleSignOut = async () => {
    localStorage.removeItem("hasLoggedIn");
    await signOut();
    navigate('/login');
  };

  // Auto-save settings when they change
  useEffect(() => {
    saveSettingsToLocalStorage();
    loadUserProfile();
  }, [notifications, emailNotifications, language, currency]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-16 md:pb-0">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-purple-500/20 hover:text-white md:flex hidden"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Settings</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-500/20 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-purple-500/20 hover:text-white md:hidden"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Profile Icon */}
          <div className="flex justify-center items-center">
            {user.user_metadata.avatar_url ?
              <div className="flex flex-col justify-center items-center h-[100px] w-[100px] rounded-[50%]">
                <img className="rounded-[50%]" src={user.user_metadata.avatar_url} alt="Profile" />
              </div>
              :
              <div className="flex justify-center items-center h-[100px] w-[100px] rounded-[50%]">
                <img className="rounded-[50%]" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRffynsRFNN4y-DlyuMLHMQl2ji-UvXKfwwGQ&s" alt="Profile" />
              </div>
            }
          </div>

          {/* Profile Settings */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={editProfile ? editUserName : userName}
                      onChange={(e) => editProfile && setEditUserName(e.target.value)}
                      className="bg-white/10 border-purple-500/30 text-white"
                      disabled={!editProfile}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-white/10 border-purple-500/30 text-white opacity-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={editProfile ? editUserPhone : userPhone}
                      onChange={(e) => editProfile && setEditUserPhone(e.target.value)}
                      className="bg-white/10 border-purple-500/30 text-white"
                      disabled={!editProfile}
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mr-10"
                      onClick={() => {
                        if (!editProfile) {
                          setEditUserName(userName);
                          setEditUserPhone(userPhone);
                        }
                        setEditProfile(!editProfile);
                      }}
                    >
                      {editProfile ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    {editProfile && (
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={isProfileLoading}
                      >
                        {isProfileLoading ? "Updating..." : "Update Details"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>

          </Card>

          {/* Password Settings */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="flex items-center mr-10">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </span>

                <div
                  onClick={() => setEditUpdatePassword(!editUpdatePassword)}
                  title="Update password"
                  className="p-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md cursor-pointer transition">
                  <Edit className="h-4 w-4 text-white" />
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-white">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/10 border-purple-500/30 text-white"
                    required
                    minLength={6}
                    disabled={!editUpdatePassword}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-new-password" className="text-white">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-purple-500/30 text-white"
                    required
                    minLength={6}
                    disabled={!editUpdatePassword}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!editUpdatePassword ||isPasswordLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Receive notifications about bookings and offers</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive booking confirmations via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          {/* <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Dark Mode</Label>
                  <p className="text-sm text-gray-400">Use dark theme throughout the app</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card> */}

          {/* Preferences */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {/* <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div> */}

          {/* Share App Button */}
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Share this App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-3">Let your friends know about this app.</p>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  navigator.share?.({
                    title: "Check out this App!",
                    text: "I'm using this awesome event booking app – try it out!",
                    url: window.location.origin,
                  }) || navigator.clipboard.writeText(window.location.origin).then(() => {
                    toast.success("Link copied to clipboard!");
                  });
                }}
              >
                Share Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation */}
      {/* <MobileNavigation /> */}
    </div>
  );
};

export default Settings;
