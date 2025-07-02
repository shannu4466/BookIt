
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Percent } from "lucide-react";
import { isExpired, formatDate } from "@/utils/offerUtils";

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

interface AvailableOffersSectionProps {
  availableOffers: Offer[];
  claimingOfferId: string | null;
  onClaimOffer: (offerId: string) => void;
}

const AvailableOffersSection = ({ availableOffers, claimingOfferId, onClaimOffer }: AvailableOffersSectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Gift className="h-6 w-6 mr-2 text-pink-400" />
        Available Offers ({availableOffers.length})
      </h2>

      {availableOffers.length === 0 ? (
        <Card className="bg-white/5 backdrop-blur-xl border-pink-500/20">
          <CardContent className="p-8 text-center">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No new offers available</p>
            <p className="text-gray-400 mt-2">Check back later for exciting new deals!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOffers.map((offer) => (
            <Card
              key={offer.id}
              className="bg-white/5 backdrop-blur-xl border-pink-500/20 overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div
                className="relative h-32 w-full bg-center bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${offer.image_url})`,
                }}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                    {offer.category}
                  </Badge>
                  {isExpired(offer.valid_until) && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      Expired
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{offer.description}</p>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex items-center text-yellow-300">
                    <Percent className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{offer.discount}</span>
                  </div>
                  <div className="flex items-center text-gray-800 font-bold">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Valid until {formatDate(offer.valid_until)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => onClaimOffer(offer.id)}
                  disabled={claimingOfferId === offer.id || isExpired(offer.valid_until)}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  {claimingOfferId === offer.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Claiming...
                    </div>
                  ) : isExpired(offer.valid_until) ? (
                    'Expired'
                  ) : (
                    'Claim Offer'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOffersSection;
