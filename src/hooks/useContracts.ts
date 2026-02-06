import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractType, RiskLevel, Party } from '@/types/legal';
import { useAuth } from '@/contexts/AuthContext';

export function useContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(contract => ({
        ...contract,
        contract_type: contract.contract_type as ContractType,
        risk_level: contract.risk_level as RiskLevel,
        parties: (contract.parties as unknown as Party[]) || [],
        analysis_status: contract.analysis_status as Contract['analysis_status'],
      })) as Contract[];
    },
    enabled: !!user,
  });
}

export function useContract(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        contract_type: data.contract_type as ContractType,
        risk_level: data.risk_level as RiskLevel,
        parties: (data.parties as unknown as Party[]) || [],
        analysis_status: data.analysis_status as Contract['analysis_status'],
      } as Contract;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      file_name: string;
      file_path: string;
      file_size?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          file_name: data.file_name,
          file_path: data.file_path,
          file_size: data.file_size,
          analysis_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Partial<{
      contract_type: ContractType;
      language: string;
      effective_date: string;
      expiry_date: string;
      jurisdiction: string;
      composite_risk_score: number;
      risk_level: RiskLevel;
      executive_summary: string;
      analysis_status: string;
      analyzed_at: string;
    }>) => {
      const { error } = await supabase
        .from('contracts')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
