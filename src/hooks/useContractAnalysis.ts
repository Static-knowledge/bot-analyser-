import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateAuditEntry } from './useAuditTrail';

export function useAnalyzeContract() {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const createAuditEntry = useCreateAuditEntry();

  return useMutation({
    mutationFn: async (contractId: string) => {
      if (!user || !session) throw new Error('Not authenticated');

      // Update status to analyzing
      await supabase
        .from('contracts')
        .update({ analysis_status: 'analyzing' })
        .eq('id', contractId);

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-contract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ contractId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();

      // Create audit entry
      await createAuditEntry.mutateAsync({
        contract_id: contractId,
        action: 'analyze',
        action_details: { result_summary: result.executive_summary },
      });

      return result;
    },
    onSuccess: (_, contractId) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      queryClient.invalidateQueries({ queryKey: ['clauses', contractId] });
    },
    onError: async (error, contractId) => {
      // Update status to failed
      await supabase
        .from('contracts')
        .update({ analysis_status: 'failed' })
        .eq('id', contractId);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
