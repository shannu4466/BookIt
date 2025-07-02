
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrendingContent = () => {
  return useQuery({
    queryKey: ['trending-content'],
    queryFn: async () => {
      // Fetch trending content from all categories
      const [moviesResult, sportsResult, eventsResult, playsResult] = await Promise.all([
        supabase
          .from('movies')
          .select('*')
          .eq('status', 'active')
          .eq('is_trending', true)
          .order('rating', { ascending: false })
          .limit(6),
        supabase
          .from('sports')
          .select('*')
          .eq('status', 'active')
          .eq('is_trending', true)
          .order('rating', { ascending: false })
          .limit(6),
        supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('is_trending', true)
          .order('rating', { ascending: false })
          .limit(6),
        supabase
          .from('plays')
          .select('*')
          .eq('status', 'active')
          .eq('is_trending', true)
          .order('rating', { ascending: false })
          .limit(6)
      ]);

      // Check for errors
      if (moviesResult.error) throw new Error(moviesResult.error.message);
      if (sportsResult.error) throw new Error(sportsResult.error.message);
      if (eventsResult.error) throw new Error(eventsResult.error.message);
      if (playsResult.error) throw new Error(playsResult.error.message);

      // Combine and format the results
      const trending = [
        ...(moviesResult.data || []).map(item => ({ ...item, type: 'movie' })),
        ...(sportsResult.data || []).map(item => ({ ...item, type: 'sport' })),
        ...(eventsResult.data || []).map(item => ({ ...item, type: 'event' })),
        ...(playsResult.data || []).map(item => ({ ...item, type: 'play' }))
      ];

      // Sort by rating and return top items
      return trending.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    },
  });
};
