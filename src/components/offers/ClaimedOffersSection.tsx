
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Tag, CheckCircle, Clock, Percent, X, Copy } from "lucide-react";
import { isExpired, formatDate } from "@/utils/offerUtils";
import { toast } from 'sonner'

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  valid_until: string;
  category: string;
  image_url: string;
  color_gradient: string;
  coupon_code?: string;
}

interface UserOffer {
  id: string;
  user_id: string;
  offer_id: string;
  claimed_at: string;
  offers: Offer;
}

interface ClaimedOffersSectionProps {
  claimedOffers: UserOffer[];
  removingOfferId: string | null;
  onRemoveOffer: (userOfferId: string) => void;
}

const ClaimedOffersSection = ({ claimedOffers, removingOfferId, onRemoveOffer }: ClaimedOffersSectionProps) => {

  const handleCopy = (coupon: string) => {
    if (coupon) {
      navigator.clipboard.writeText(coupon)
        .then(() => {
          toast.success("Copied!");
        })
        .catch(err => {
          toast.error("Failed to copy");
        });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
        Your Claimed Offers ({claimedOffers.length})
      </h2>

      {claimedOffers.length === 0 ? (
        <Card className="bg-white/5 backdrop-blur-xl border-pink-500/20">
          <CardContent className="p-8 text-center">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">You haven't claimed any offers yet</p>
            <p className="text-gray-400 mt-2">Browse available offers below to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claimedOffers.map((userOffer) => (
            <Card
              key={userOffer.id}
              className={`bg-white/5 backdrop-blur-xl border-pink-900/20 overflow-hidden transition-all duration-300 hover:scale-105 ${isExpired(userOffer.offers.valid_until) ? 'opacity-60' : ''
                }`}
            >
              <div
                className="relative h-32 w-full bg-center bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${userOffer.offers.image_url})`,
                }}
              >
                <Button
                  onClick={() => onRemoveOffer(userOffer.id)}
                  disabled={removingOfferId === userOffer.id}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
                  size="sm"
                >
                  {removingOfferId === userOffer.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Claimed
                  </Badge>
                  {isExpired(userOffer.offers.valid_until) && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      Expired
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{userOffer.offers.title}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{userOffer.offers.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-yellow-300">
                    <Percent className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{userOffer.offers.discount}</span>
                  </div>

                  {userOffer.offers.coupon_code && (
                    <div className="flex items-center text-blue-100">
                      <Tag className="h-4 w-4 mr-2" />
                      <span className="font-mono text-xs bg-blue-500/20 px-2 py-1 rounded flex items-center">
                        {userOffer.offers.coupon_code}
                        <Copy
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={() => handleCopy(userOffer.offers.coupon_code!)}
                        />
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-800 font-bold">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Valid until {formatDate(userOffer.offers.valid_until)}</span>
                  </div>

                  <div className="flex items-center text-gray-800 font-bold">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Claimed on {formatDate(userOffer.claimed_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimedOffersSection;
