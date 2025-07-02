
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlays = (location?: string) => {
  return useQuery({
    queryKey: ['plays', location],
    queryFn: async () => {
      let query = supabase
        .from('plays')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (location) {
        query = query.eq('location', location.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

export const useTrendingPlays = () => {
  return useQuery({
    queryKey: ['trending-plays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .eq('status', 'active')
        .eq('is_trending', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
};

export const usePlay = (id: string) => {
  return useQuery({
    queryKey: ['play', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!id,
  });
};
