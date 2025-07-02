
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import ClaimedOffersSection from "@/components/offers/ClaimedOffersSection";
import AvailableOffersSection from "@/components/offers/AvailableOffersSection";
import { useMyOffers } from "@/hooks/useMyOffers";

const MyOffers = () => {
  const {
    claimedOffers,
    availableOffers,
    loading,
    claimingOfferId,
    removingOfferId,
    handleClaimOffer,
    handleRemoveOffer
  } = useMyOffers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-600 to-indigo-700 pb-16 md:pb-0">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-pink-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-pink-500/20 border border-pink-500/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent pr-[5%]">
              My Offers
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Claimed Offers Section */}
          <ClaimedOffersSection 
            claimedOffers={claimedOffers}
            removingOfferId={removingOfferId}
            onRemoveOffer={handleRemoveOffer}
          />

          {/* Available Offers Section */}
          <AvailableOffersSection 
            availableOffers={availableOffers}
            claimingOfferId={claimingOfferId}
            onClaimOffer={handleClaimOffer}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {/* <MobileNavigation /> */}
    </div>
  );
};

export default MyOffers;
