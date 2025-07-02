
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEvents = (location?: string) => {
  return useQuery({
    queryKey: ['events', location],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .order('event_date', { ascending: true });

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

export const useTrendingEvents = () => {
  return useQuery({
    queryKey: ['trending-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
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

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
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
