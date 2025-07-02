
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useMyOffers = () => {
  const { user } = useAuth();
  const [claimedOffers, setClaimedOffers] = useState<UserOffer[]>([]);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOfferId, setClaimingOfferId] = useState<string | null>(null);
  const [removingOfferId, setRemovingOfferId] = useState<string | null>(null);

  const fetchMyOffers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_offers')
      .select(`
        *,
        offers (*)
      `)
      .eq('user_id', user.id)
      .order('claimed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user offers:', error);
      toast.error('Failed to load your offers');
      return;
    }

    setClaimedOffers(data || []);
  };

  const fetchAvailableOffers = async () => {
    if (!user) return;

    // First get all offers
    const { data: allOffers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return;
    }

    // Then get user's claimed offers
    const { data: userOffers, error: userOffersError } = await supabase
      .from('user_offers')
      .select('offer_id')
      .eq('user_id', user.id);

    if (userOffersError) {
      console.error('Error fetching user offers:', userOffersError);
      return;
    }

    const claimedOfferIds = userOffers?.map(uo => uo.offer_id) || [];
    
    // Filter out already claimed offers
    const availableOffers = allOffers?.filter(offer => 
      !claimedOfferIds.includes(offer.id)
    ) || [];

    setAvailableOffers(availableOffers);
    setLoading(false);
  };

  const handleClaimOffer = async (offerId: string) => {
    if (!user) {
      toast.error('Please login to claim offers');
      return;
    }

    setClaimingOfferId(offerId);

    const { error } = await supabase
      .from('user_offers')
      .insert([
        {
          user_id: user.id,
          offer_id: offerId
        }
      ]);

    if (error) {
      console.error('Error claiming offer:', error);
      toast.error('Failed to claim offer');
    } else {
      toast.success('Offer claimed successfully!');
      fetchMyOffers();
      fetchAvailableOffers();
    }

    setClaimingOfferId(null);
  };

  const handleRemoveOffer = async (userOfferId: string) => {
    if (!user) {
      toast.error('Please login to remove offers');
      return;
    }

    console.log('Attempting to remove offer with ID:', userOfferId);
    setRemovingOfferId(userOfferId);

    try {
      const { data, error } = await supabase
        .from('user_offers')
        .delete()
        .eq('id', userOfferId)
        .eq('user_id', user.id)
        .select();

      console.log('Delete operation result:', { data, error });

      if (error) {
        console.error('Error removing offer:', error);
        toast.error('Failed to remove offer: ' + error.message);
      } else if (data && data.length > 0) {
        console.log('Offer removed successfully:', data);
        toast.success('Offer removed successfully!');
        
        // Immediately update the UI by filtering out the removed offer
        setClaimedOffers(prevOffers => 
          prevOffers.filter(offer => offer.id !== userOfferId)
        );
        
        // Also refresh the data from the server
        await fetchMyOffers();
        await fetchAvailableOffers();
      } else {
        console.log('No offer was deleted - might already be removed');
        toast.error('Offer not found or already removed');
      }
    } catch (err) {
      console.error('Unexpected error removing offer:', err);
      toast.error('Unexpected error occurred');
    }

    setRemovingOfferId(null);
  };

  useEffect(() => {
    if (user) {
      fetchMyOffers();
      fetchAvailableOffers();
    }
  }, [user]);

  return {
    claimedOffers,
    availableOffers,
    loading,
    claimingOfferId,
    removingOfferId,
    handleClaimOffer,
    handleRemoveOffer,
    fetchMyOffers,
    fetchAvailableOffers
  };
};
