import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserCheck, UserX, Clock, Building2, ServerCog, FileKey } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminRequest {
    id: string;
    name: string;
    email: string;
    location: string;
    license_id: string;
    status: string;
    password_hash: string;
    created_at: string;
}

const SuperAdmin = () => {
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Basic super admin protection check
        const adminUserStr = localStorage.getItem("adminUser");
        if (!adminUserStr) {
            navigate("/admin/login");
            return;
        }

        try {
            const adminUser = JSON.parse(adminUserStr);
            if (!adminUser.is_superadmin) {
                toast.error("Unauthorized. Super Admin access only.");
                navigate("/admin/dashboard");
                return;
            }
        } catch {
            navigate("/admin/login");
            return;
        }

        fetchRequests();
    }, [navigate]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching admin requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (request: AdminRequest, action: 'approved' | 'rejected') => {
        try {
            // 1. Update the request status
            const { error: updateError } = await supabase
                .from('admin_requests')
                .update({ status: action })
                .eq('id', request.id);

            if (updateError) throw updateError;

            // 2. If approved, migrate to admin_users table
            if (action === 'approved') {
                const { error: insertError } = await supabase
                    .from('admin_users')
                    .insert([{
                        name: request.name,
                        email: request.email,
                        password_hash: request.password_hash,
                        location: request.location,
                        license_id: request.license_id,
                        is_superadmin: false
                    }]);

                if (insertError) {
                    console.error("Migration error:", insertError);
                    toast.error("Failed to migrate admin user");
                    // Revert status safely
                    await supabase.from('admin_requests').update({ status: 'pending' }).eq('id', request.id);
                    return;
                }
            }

            toast.success(`Request ${action} successfully!`);
            // Update local state to immediately show the change
            setRequests((prev) => prev.map((req) => req.id === request.id ? { ...req, status: action } : req));

        } catch (error: any) {
            console.error(`Error updating request to ${action}:`, error);
            toast.error(error.message || `Failed to ${action} request`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-inter text-white">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <ServerCog className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Super Admin Dashboard
                            </h1>
                            <p className="text-gray-400">Manage pending theater applications across all cities.</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="border-white/10 text-gray-900 hover:text-black">
                        Back to Main Dashboard
                    </Button>
                </div>

                {/* Pending Requests */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Pending Requests ({requests.filter(r => r.status === 'pending').length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req) => (
                            <Card key={req.id} className="bg-slate-900/50 border-white/10 backdrop-blur-md overflow-hidden flex flex-col">
                                <CardHeader className="pb-3 border-b border-white/5 bg-black/20">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold text-white truncate pr-2">{req.name}</CardTitle>
                                        <Badge variant="outline" className={`
                        capitalize shrink-0
                       ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
                       ${req.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
                       ${req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : ''}
                    `}>
                                            {req.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 flex-1 space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                                            <span className="truncate">{req.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <ServerCog className="w-4 h-4 text-gray-500 shrink-0" />
                                            <span className="capitalize border border-white/10 rounded-md px-2 py-0.5 bg-black/20 text-xs">
                                                {req.location}
                                            </span>
                                        </div>
                                        {req.license_id && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <FileKey className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="font-mono text-blue-300 text-xs truncate">ID: {req.license_id}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Applied: {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {req.status === 'pending' && (
                                        <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                                            <Button
                                                onClick={() => handleAction(req, 'approved')}
                                                className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(req, 'rejected')}
                                                variant="outline"
                                                className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 hover:border-red-500/50"
                                            >
                                                <UserX className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {requests.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                                <p className="text-gray-500">No admin registration requests found.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SuperAdmin;
