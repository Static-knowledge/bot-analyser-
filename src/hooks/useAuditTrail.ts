import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuditEntry, AuditAction } from '@/types/legal';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export function useAuditTrail(contractId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['audit-trail', contractId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('audit_trail')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contractId) {
        query = query.eq('contract_id', contractId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(entry => ({
        ...entry,
        action: entry.action as AuditAction,
        action_details: (entry.action_details as Record<string, unknown>) || {},
      })) as AuditEntry[];
    },
    enabled: !!user,
  });
}

export function useCreateAuditEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      contract_id?: string;
      action: AuditAction;
      action_details?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('audit_trail')
        .insert([{
          user_id: user.id,
          action: data.action,
          action_details: (data.action_details || {}) as Json,
          user_agent: navigator.userAgent,
          contract_id: data.contract_id || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-trail'] });
    },
  });
}
