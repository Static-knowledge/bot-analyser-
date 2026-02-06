import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContractTemplate, ContractType, TemplateVariable } from '@/types/legal';
import { useAuth } from '@/contexts/AuthContext';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('is_public', true)
        .order('name');
      
      if (error) throw error;
      
      return data.map(template => ({
        ...template,
        contract_type: template.contract_type as ContractType,
        variables: (template.variables as unknown as TemplateVariable[]) || [],
      })) as ContractTemplate[];
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        contract_type: data.contract_type as ContractType,
        variables: (data.variables as unknown as TemplateVariable[]) || [],
      } as ContractTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateUserTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      template_id?: string;
      name: string;
      content: string;
      variables_filled: Record<string, string>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: template, error } = await supabase
        .from('user_templates')
        .insert({
          user_id: user.id,
          template_id: data.template_id,
          name: data.name,
          content: data.content,
          variables_filled: data.variables_filled,
        })
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

export function useUserTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
