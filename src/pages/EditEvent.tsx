import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { title } from "process";

const EditEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { type, id } = useParams<{ type: string; id: string }>();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        price_range: "",
        image_url: "",
        is_trending: false,
        // Movie/Play specific
        genre: "",
        duration: "",
        language: "",
        venue: "",
        show_times: "",
        trailer_url: "",
        release_date: "",
        // Event specific
        category: "",
        event_date: "",
        event_time: "",
        // Sports specific
        sport_type: "",
        teams: "",
        match_date: "",
        match_time: "",
    });

    useEffect(() => {
        window.scrollTo(0, 0);

        const adminUserStr = localStorage.getItem('adminUser');
        if (adminUserStr) {
            const user = JSON.parse(adminUserStr);
            setIsSuperAdmin(user.is_superadmin);
        }

        const fetchData = async () => {
            if (!type || !id) return;

            setLoading(true);
            try {
                const tableName =
                    type === "movie" ? "movies" :
                        type === "event" ? "events" :
                            type === "play" ? "plays" :
                                type === "sport" ? "sports" : "";

                const { data, error } = await supabase
                    .from(tableName)
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setFormData({
                    ...formData,
                    ...data,
                    show_times: data?.show_times?.join(", ") || "",
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load event data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id]);

    const locations = [
        "hyderabad", "mumbai", "delhi", "bangalore", "chennai",
        "kolkata", "pune", "visakhapatnam", "vijayawada"
    ];

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let updateData: any = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                price_range: formData.price_range,
                image_url: formData.image_url,
                is_trending: formData.is_trending,
            };

            if (type === 'movie') {
                updateData = {
                    ...updateData,
                    genre: formData.genre,
                    duration: formData.duration,
                    language: formData.language,
                    venue: formData.venue,
                    show_times: formData.show_times
                        ? formData.show_times.split(',').map(t => t.trim())
                        : [],
                    trailer_url: formData.trailer_url,
                    release_date: formData.release_date || null,
                };

                const { error } = await supabase.from('movies').update(updateData).eq('id', id);
                if (error) throw error;

            } else if (type === 'event') {
                updateData = {
                    ...updateData,
                    category: formData.category,
                    venue: formData.venue,
                    event_date: formData.event_date || null,
                    event_time: formData.event_time || null,
                };

                const { error } = await supabase.from('events').update(updateData).eq('id', id);
                if (error) throw error;

            } else if (type === 'play') {
                updateData = {
                    ...updateData,
                    genre: formData.genre,
                    duration: formData.duration,
                    language: formData.language,
                    venue: formData.venue,
                    show_times: formData.show_times
                        ? formData.show_times.split(',').map(t => t.trim())
                        : [],
                };

                const { error } = await supabase.from('plays').update(updateData).eq('id', id);
                if (error) throw error;

            } else if (type === 'sport') {
                updateData = {
                    ...updateData,
                    sport_type: formData.sport_type,
                    teams: formData.teams,
                    venue: formData.venue,
                    match_date: formData.match_date || null,
                    match_time: formData.match_time || null,
                };

                const { error } = await supabase.from('sports').update(updateData).eq('id', id);
                if (error) throw error;
            }

            toast.success(`${type} updated successfully!`);
            navigate('/admin/dashboard');

        } catch (error) {
            console.error('Error updating content:', error);
            toast.error('Failed to update content');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between gap-4">
                        <Button
                            onClick={() => navigate('/admin/dashboard')}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Update {type?.charAt(0).toUpperCase()}{type?.slice(1)}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader className="flex justify-center items-center">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{type.toUpperCase()} : {formData.title} (updating...)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Common fields */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-white">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-white">Location *</Label>
                                    {isSuperAdmin ? (
                                        <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                                                {locations.map((location) => (
                                                    <SelectItem key={location} value={location}>
                                                        {location.charAt(0).toUpperCase() + location.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="relative">
                                            <Input
                                                value={formData.location ? formData.location.charAt(0).toUpperCase() + formData.location.slice(1) : ""}
                                                className="bg-white/5 border-purple-500/20 text-gray-400 cursor-not-allowed"
                                                disabled
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 font-medium tracking-wide uppercase">Locked</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price_range" className="text-white">Price Range</Label>
                                    <Input
                                        id="price_range"
                                        value={formData.price_range}
                                        onChange={(e) => handleInputChange('price_range', e.target.value)}
                                        className="bg-white/10 border-purple-500/30 text-white"
                                        placeholder="₹200 - ₹500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_url" className="text-white">Image URL</Label>
                                <Input
                                    id="image_url"
                                    value={formData.image_url}
                                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                                    className="bg-white/10 border-purple-500/30 text-white"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {/* Type-specific fields */}
                            {(type === 'movie' || type === 'play') && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="genre" className="text-white">Genre *</Label>
                                            <Input
                                                id="genre"
                                                value={formData.genre}
                                                onChange={(e) => handleInputChange('genre', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="text-white">Duration</Label>
                                            <Input
                                                id="duration"
                                                value={formData.duration}
                                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                                placeholder="2h 30m"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="language" className="text-white">Language</Label>
                                            <Input
                                                id="language"
                                                value={formData.language}
                                                onChange={(e) => handleInputChange('language', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="venue" className="text-white">Theater/Venue</Label>
                                            <Input
                                                id="venue"
                                                value={formData.venue}
                                                onChange={(e) => handleInputChange('venue', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="show_times" className="text-white">Show Times (comma separated)</Label>
                                        <Input
                                            id="show_times"
                                            value={formData.show_times}
                                            onChange={(e) => handleInputChange('show_times', e.target.value)}
                                            className="bg-white/10 border-purple-500/30 text-white"
                                            placeholder="10:00 AM, 2:00 PM, 6:00 PM"
                                        />
                                    </div>

                                    {type === 'movie' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="trailer_url" className="text-white">Trailer URL</Label>
                                                <Input
                                                    id="trailer_url"
                                                    value={formData.trailer_url}
                                                    onChange={(e) => handleInputChange('trailer_url', e.target.value)}
                                                    className="bg-white/10 border-purple-500/30 text-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="release_date" className="text-white">Release Date</Label>
                                                <Input
                                                    id="release_date"
                                                    type="date"
                                                    value={formData.release_date}
                                                    onChange={(e) => handleInputChange('release_date', e.target.value)}
                                                    className="bg-white/10 border-purple-500/30 text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {type === 'event' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-white">Category *</Label>
                                            <Input
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="venue" className="text-white">Venue</Label>
                                            <Input
                                                id="venue"
                                                value={formData.venue}
                                                onChange={(e) => handleInputChange('venue', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="event_date" className="text-white">Event Date</Label>
                                            <Input
                                                id="event_date"
                                                type="date"
                                                value={formData.event_date}
                                                onChange={(e) => handleInputChange('event_date', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="event_time" className="text-white">Event Time</Label>
                                            <Input
                                                id="event_time"
                                                type="time"
                                                value={formData.event_time}
                                                onChange={(e) => handleInputChange('event_time', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {type === 'sport' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sport_type" className="text-white">Sport Type *</Label>
                                            <Input
                                                id="sport_type"
                                                value={formData.sport_type}
                                                onChange={(e) => handleInputChange('sport_type', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="teams" className="text-white">Teams</Label>
                                            <Input
                                                id="teams"
                                                value={formData.teams}
                                                onChange={(e) => handleInputChange('teams', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                                placeholder="Team A vs Team B"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="venue" className="text-white">Venue</Label>
                                        <Input
                                            id="venue"
                                            value={formData.venue}
                                            onChange={(e) => handleInputChange('venue', e.target.value)}
                                            className="bg-white/10 border-purple-500/30 text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="match_date" className="text-white">Match Date</Label>
                                            <Input
                                                id="match_date"
                                                type="date"
                                                value={formData.match_date}
                                                onChange={(e) => handleInputChange('match_date', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="match_time" className="text-white">Match Time</Label>
                                            <Input
                                                id="match_time"
                                                type="time"
                                                value={formData.match_time}
                                                onChange={(e) => handleInputChange('match_time', e.target.value)}
                                                className="bg-white/10 border-purple-500/30 text-white"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_trending"
                                    checked={formData.is_trending}
                                    onCheckedChange={(checked) => handleInputChange('is_trending', checked)}
                                />
                                <Label htmlFor="is_trending" className="text-white">Mark as Trending</Label>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update {type}
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditEvent;
