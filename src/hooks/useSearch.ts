import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const useSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (query: string, location: string) => {
    setLoading(true);
    let allResults: any[] = [];
    // Movies
    const movies = await supabase
      .from("movies")
      .select("*")
      .ilike("title", `%${query}%`)
      .ilike("location", `%${location}%`);
    if (movies.data) allResults = [...allResults, ...movies.data.map(m => ({ ...m, type: "movie" }))];
    // Events
    const events = await supabase
      .from("events")
      .select("*")
      .ilike("title", `%${query}%`)
      .ilike("location", `%${location}%`);
    if (events.data) allResults = [...allResults, ...events.data.map(e => ({ ...e, type: "event" }))];
    // Plays
    const plays = await supabase
      .from("plays")
      .select("*")
      .ilike("title", `%${query}%`)
      .ilike("location", `%${location}%`);
    if (plays.data) allResults = [...allResults, ...plays.data.map(p => ({ ...p, type: "play" }))];
    // Sports
    const sports = await supabase
      .from("sports")
      .select("*")
      .ilike("title", `%${query}%`)
      .ilike("location", `%${location}%`);
    if (sports.data) allResults = [...allResults, ...sports.data.map(s => ({ ...s, type: "sport" }))];
    setResults(allResults);
    setLoading(false);
  };

  return { results, loading, search };
};

export default useSearch;
