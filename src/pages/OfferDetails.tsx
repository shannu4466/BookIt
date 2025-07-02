import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Percent, Gift, Tag, Clock, Info, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  image_url: string;
  valid_until: string;
  category: string;
  color_gradient: string;
}

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching offer:', error);
        toast.error('Offer not found');
        navigate('/');
        return;
      }

      setOffer(data);
      setLoading(false);
    };

    const checkIfAlreadyClaimed = async () => {
      if (!id) return;

      if (!user) navigate("/login")

      const { data, error } = await supabase
        .from('user_offers')
        .select('id')
        .eq('user_id', user.id)
        .eq('offer_id', id)
        .single();

      if (data) {
        setAlreadyClaimed(true);
      }
    };

    fetchOffer();
    checkIfAlreadyClaimed();
  }, [id, user, navigate]);

  const handleClaimOffer = async () => {
    if (!offer) return;

    if (!user) navigate("/login")

    setClaiming(true);

    const { error } = await supabase
      .from('user_offers')
      .insert([
        {
          user_id: user.id,
          offer_id: offer.id,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already claimed this offer!');
      } else {
        toast.error('Failed to claim offer');
      }
    } else {
      toast.success('Offer claimed successfully! View your coupon codes in My Offers section');
      setAlreadyClaimed(true);
    }

    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Offer not found</h1>
          <Link to="/">
            <Button variant="outline" className="border-purple-500/30 text-white hover:bg-purple-500/20">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-500/20" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Offer Details</h1>
            </div>
          </div>
        </div>
      </nav>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      ) : !offer ? (
        <div className="text-center py-20">
          <Gift className="h-24 w-24 text-purple-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">Offer Not Found</h2>
          <p className="text-gray-400 mb-6">The offer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Go Back Home
          </Button>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20">
              <div className="relative">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-80 object-cover"
                />
                <div className={`absolute top-6 right-6 bg-gradient-to-r ${offer.color_gradient} rounded-2xl px-6 py-3 shadow-2xl`}>
                  <span className="text-white text-xl font-bold">{offer.discount}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl font-bold text-white mb-2">{offer.title}</h1>
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Valid until {offer.valid_until}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">About This Offer</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">{offer.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-2 flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-purple-400" />
                        Category
                      </h3>
                      <p className="text-gray-300 capitalize">{offer.category}</p>
                    </div>

                    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-2 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-pink-400" />
                        Validity
                      </h3>
                      <p className="text-gray-300">{offer.valid_until}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-400" />
                      Terms & Conditions
                    </h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Valid for single use per customer</li>
                      <li>• Cannot be combined with other offers</li>
                      <li>• Valid at participating locations only</li>
                      <li>• Offer valid until {offer.valid_until}</li>
                      <li>• Subject to availability</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    {alreadyClaimed ? (
                      <Button
                        disabled
                        className="flex-1 bg-green-600 hover:bg-green-600 cursor-not-allowed"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Already Claimed
                      </Button>
                    ) : (
                      <Button
                        onClick={handleClaimOffer}
                        disabled={claiming}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                      >
                        {claiming ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Claiming...
                          </div>
                        ) : (
                          <>
                            <Gift className="h-5 w-5 mr-2" />
                            Claim This Offer
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="flex-1 border-purple-500/50 text-white hover:text-white bg-white-500/20 hover:bg-purple-500/20"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetails;
