import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { MapPin, User, Building2, ShieldCheck, Mail, FileKey } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { hashPassword } from "@/utils/crypto";

const locations = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "kolkata", label: "Kolkata" },
    { value: "pune", label: "Pune" },
    { value: "visakhapatnam", label: "Visakhapatnam" },
    { value: "vijayawada", label: "Vijayawada" },
];

const AdminRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        location: "",
        license_id: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.location || !formData.license_id) {
            toast.error("Please fill in all fields including License ID");
            return;
        }

        setLoading(true);
        try {
            const hashedPassword = await hashPassword(formData.password);

            const { error } = await supabase.from('admin_requests').insert([
                {
                    name: formData.name,
                    email: formData.email,
                    password_hash: hashedPassword,
                    location: formData.location,
                    license_id: formData.license_id
                }
            ]);

            if (error) {
                if (error.code === '23505') throw new Error("An application with this email already exists");
                throw error;
            }

            toast.success("Request submitted successfully! Wait for client approval.");
            navigate("/");
        } catch (error: any) {
            console.error('Registration Error:', error);
            toast.error(error.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-inter">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border-white/10 shadow-2xl z-10">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <Building2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Partner Registration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Request an admin account to manage listings in your city.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Theater/Business Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    name="name"
                                    placeholder="e.g. PVR Cinemas"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Admin Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="admin@theater.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Password</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Theater / Event License ID</Label>
                            <div className="relative">
                                <FileKey className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    name="license_id"
                                    placeholder="Enter your official license ID"
                                    value={formData.license_id}
                                    onChange={handleChange}
                                    className="pl-9 bg-slate-950/50 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Operating City</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, location: val })}>
                                <SelectTrigger className="w-full bg-slate-950/50 border-white/10 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20">
                                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                    <SelectValue placeholder="Select your primary location" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.value} value={loc.value} className="focus:bg-blue-500/20 focus:text-white cursor-pointer">
                                            {loc.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 mt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium border-0 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)]"
                        >
                            {loading ? "Submitting..." : "Submit Registration Request"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate("/")}
                            className="text-gray-400 hover:text-white hover:bg-white/5 w-full"
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminRegister;
