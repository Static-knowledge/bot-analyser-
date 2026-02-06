import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlossaryTerm } from '@/types/legal';

export function useGlossary(searchTerm?: string) {
  return useQuery({
    queryKey: ['glossary', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('glossary_terms')
        .select('*')
        .order('term');
      
      if (searchTerm) {
        query = query.or(`term.ilike.%${searchTerm}%,definition_en.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });
}
