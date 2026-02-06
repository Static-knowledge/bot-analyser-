import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clause, ClauseCategory, RiskLevel, ComplianceFlag } from '@/types/legal';
import { Json } from '@/integrations/supabase/types';

export function useClauses(contractId: string) {
  return useQuery({
    queryKey: ['clauses', contractId],
    queryFn: async () => {
      if (!contractId) return [];
      
      const { data, error } = await supabase
        .from('clauses')
        .select('*')
        .eq('contract_id', contractId)
        .order('clause_number', { ascending: true });
      
      if (error) throw error;
      
      return data.map(clause => ({
        ...clause,
        category: clause.category as ClauseCategory,
        risk_level: clause.risk_level as RiskLevel,
        compliance_flags: (clause.compliance_flags as unknown as ComplianceFlag[]) || [],
      })) as Clause[];
    },
    enabled: !!contractId,
  });
}

export function useUpdateClause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      contract_id,
      ...data
    }: { id: string; contract_id: string } & Partial<{
      clause_number: number;
      original_text: string;
      plain_explanation: string;
      risk_rationale: string;
      risk_score: number;
      risk_level: RiskLevel;
      category: ClauseCategory;
      suggested_alternative: string;
      negotiation_script: string;
      is_flagged: boolean;
    }>) => {
      const { error } = await supabase
        .from('clauses')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clauses', variables.contract_id] });
    },
  });
}
