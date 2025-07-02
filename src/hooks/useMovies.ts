
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMovies = (location?: string) => {
  return useQuery({
    queryKey: ['movies', location],
    queryFn: async () => {
      let query = supabase
        .from('movies')
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

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['trending-movies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
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

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
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
