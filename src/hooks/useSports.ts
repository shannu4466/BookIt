
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSports = (location?: string) => {
  return useQuery({
    queryKey: ['sports', location],
    queryFn: async () => {
      let query = supabase
        .from('sports')
        .select('*')
        .eq('status', 'active')
        .order('match_date', { ascending: true });

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

export const useTrendingSports = () => {
  return useQuery({
    queryKey: ['trending-sports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
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

export const useSport = (id: string) => {
  return useQuery({
    queryKey: ['sport', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
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
