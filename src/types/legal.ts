export type ContractType = 
  | 'employment_agreement'
  | 'vendor_contract'
  | 'lease_agreement'
  | 'partnership_deed'
  | 'service_contract'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ClauseCategory = 
  | 'obligations'
  | 'rights'
  | 'prohibitions'
  | 'termination'
  | 'indemnity'
  | 'liability'
  | 'confidentiality'
  | 'ip_transfer'
  | 'non_compete'
  | 'auto_renewal'
  | 'payment'
  | 'dispute_resolution'
  | 'other';

export type AuditAction = 
  | 'upload'
  | 'analyze'
  | 'export'
  | 'template_generated'
  | 'clause_edited'
  | 'version_created';

export interface Contract {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  contract_type: ContractType;
  language: string;
  parties: Party[];
  effective_date?: string;
  expiry_date?: string;
  jurisdiction?: string;
  composite_risk_score: number;
  risk_level: RiskLevel;
  executive_summary?: string;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Party {
  name: string;
  role: string;
}

export interface Clause {
  id: string;
  contract_id: string;
  clause_number: number;
  original_text: string;
  plain_explanation?: string;
  risk_rationale?: string;
  risk_score: number;
  risk_level: RiskLevel;
  category: ClauseCategory;
  suggested_alternative?: string;
  negotiation_script?: string;
  compliance_flags: ComplianceFlag[];
  similarity_score: number;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFlag {
  issue: string;
  law_reference?: string;
  severity: RiskLevel;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  contract_type: ContractType;
  content: string;
  variables: TemplateVariable[];
  risk_posture: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition_en: string;
  definition_hi?: string;
  example_usage?: string;
  category?: string;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  contract_id?: string;
  action: AuditAction;
  action_details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AnalysisResult {
  contract_type: ContractType;
  parties: Party[];
  effective_date?: string;
  expiry_date?: string;
  jurisdiction?: string;
  composite_risk_score: number;
  risk_level: RiskLevel;
  executive_summary: string;
  clauses: ClauseAnalysis[];
}

export interface ClauseAnalysis {
  clause_number: number;
  original_text: string;
  plain_explanation: string;
  risk_rationale: string;
  risk_score: number;
  risk_level: RiskLevel;
  category: ClauseCategory;
  suggested_alternative?: string;
  negotiation_script?: string;
  compliance_flags: ComplianceFlag[];
}
