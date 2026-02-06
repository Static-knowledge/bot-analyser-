-- Create contract type enum
CREATE TYPE public.contract_type AS ENUM (
  'employment_agreement',
  'vendor_contract',
  'lease_agreement',
  'partnership_deed',
  'service_contract',
  'other'
);

-- Create risk level enum
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create clause category enum
CREATE TYPE public.clause_category AS ENUM (
  'obligations',
  'rights',
  'prohibitions',
  'termination',
  'indemnity',
  'liability',
  'confidentiality',
  'ip_transfer',
  'non_compete',
  'auto_renewal',
  'payment',
  'dispute_resolution',
  'other'
);

-- Create audit action enum
CREATE TYPE public.audit_action AS ENUM (
  'upload',
  'analyze',
  'export',
  'template_generated',
  'clause_edited',
  'version_created'
);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  contract_type contract_type DEFAULT 'other',
  language TEXT DEFAULT 'en',
  parties JSONB DEFAULT '[]',
  effective_date DATE,
  expiry_date DATE,
  jurisdiction TEXT,
  composite_risk_score INTEGER DEFAULT 0,
  risk_level risk_level DEFAULT 'low',
  executive_summary TEXT,
  analysis_status TEXT DEFAULT 'pending',
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Clauses table
CREATE TABLE public.clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  clause_number INTEGER NOT NULL,
  original_text TEXT NOT NULL,
  plain_explanation TEXT,
  risk_rationale TEXT,
  risk_score INTEGER DEFAULT 0,
  risk_level risk_level DEFAULT 'low',
  category clause_category DEFAULT 'other',
  suggested_alternative TEXT,
  negotiation_script TEXT,
  compliance_flags JSONB DEFAULT '[]',
  similarity_score DECIMAL(5,2) DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Contract templates table
CREATE TABLE public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  contract_type contract_type NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  risk_posture TEXT DEFAULT 'balanced',
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Glossary terms table
CREATE TABLE public.glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  definition_hi TEXT,
  example_usage TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Audit trail table
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  action_details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User generated templates (customized from library)
CREATE TABLE public.user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables_filled JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Users can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON public.contracts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for clauses (via contract ownership)
CREATE POLICY "Users can view clauses of their contracts"
  ON public.clauses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = clauses.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clauses to their contracts"
  ON public.clauses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = clauses.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clauses of their contracts"
  ON public.clauses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = clauses.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clauses of their contracts"
  ON public.clauses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = clauses.contract_id
      AND contracts.user_id = auth.uid()
    )
  );

-- RLS Policies for contract_templates (public read, admin write)
CREATE POLICY "Anyone can view public templates"
  ON public.contract_templates FOR SELECT
  USING (is_public = TRUE);

-- RLS Policies for glossary_terms (public read)
CREATE POLICY "Anyone can view glossary terms"
  ON public.glossary_terms FOR SELECT
  USING (TRUE);

-- RLS Policies for audit_trail
CREATE POLICY "Users can view their own audit trail"
  ON public.audit_trail FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit entries"
  ON public.audit_trail FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_templates
CREATE POLICY "Users can view their own templates"
  ON public.user_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.user_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.user_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.user_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_clauses_updated_at
  BEFORE UPDATE ON public.clauses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_contract_templates_updated_at
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_templates_updated_at
  BEFORE UPDATE ON public.user_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

-- Storage policies for contracts bucket
CREATE POLICY "Users can view their own contract files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own contract files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert default glossary terms
INSERT INTO public.glossary_terms (term, definition_en, definition_hi, example_usage, category) VALUES
('Indemnification', 'A promise by one party to compensate the other party for losses or damages arising from certain events.', 'एक पक्ष द्वारा कुछ घटनाओं से उत्पन्न होने वाले नुकसान या क्षति के लिए दूसरे पक्ष को क्षतिपूर्ति करने का वादा।', 'The vendor shall indemnify the client against all claims arising from product defects.', 'liability'),
('Force Majeure', 'Unforeseeable circumstances that prevent someone from fulfilling a contract.', 'ऐसी अप्रत्याशित परिस्थितियां जो किसी को अनुबंध पूरा करने से रोकती हैं।', 'Neither party shall be liable for delays caused by force majeure events.', 'liability'),
('Non-Compete Clause', 'A restriction preventing a party from engaging in competitive business activities.', 'एक प्रतिबंध जो किसी पक्ष को प्रतिस्पर्धी व्यावसायिक गतिविधियों में शामिल होने से रोकता है।', 'Employee agrees not to work for competitors for 2 years after termination.', 'prohibitions'),
('Jurisdiction', 'The official power to make legal decisions and judgments over a case.', 'किसी मामले पर कानूनी निर्णय लेने की आधिकारिक शक्ति।', 'This contract shall be governed by the laws of Maharashtra, India.', 'dispute_resolution'),
('Arbitration', 'A method of dispute resolution using an independent third party.', 'एक स्वतंत्र तृतीय पक्ष का उपयोग करके विवाद समाधान की विधि।', 'All disputes shall be resolved through arbitration in Delhi.', 'dispute_resolution'),
('Confidentiality', 'The obligation to keep certain information private and not disclose it.', 'कुछ जानकारी को निजी रखने और उसका खुलासा न करने का दायित्व।', 'Both parties shall maintain confidentiality of trade secrets.', 'confidentiality'),
('Termination for Cause', 'Ending a contract due to a material breach by one party.', 'एक पक्ष द्वारा महत्वपूर्ण उल्लंघन के कारण अनुबंध समाप्त करना।', 'Either party may terminate for cause with 30 days written notice.', 'termination'),
('Limitation of Liability', 'A cap on the amount of damages one party can claim from another.', 'एक पक्ष द्वारा दूसरे से दावा किए जा सकने वाले नुकसान की राशि पर सीमा।', 'Total liability shall not exceed the contract value.', 'liability'),
('Auto-Renewal', 'Automatic extension of a contract unless actively cancelled.', 'जब तक सक्रिय रूप से रद्द नहीं किया जाता, अनुबंध का स्वचालित विस्तार।', 'This agreement shall automatically renew for successive 1-year periods.', 'termination'),
('Intellectual Property', 'Creations of the mind such as inventions, designs, and brand names.', 'मन की रचनाएं जैसे आविष्कार, डिजाइन और ब्रांड नाम।', 'All IP created during employment belongs to the company.', 'ip_transfer');

-- Insert default contract templates
INSERT INTO public.contract_templates (name, description, contract_type, content, variables, risk_posture, is_public) VALUES
('Basic Employment Agreement', 'Standard employment contract for Indian companies', 'employment_agreement', 
'EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on {{effective_date}} between:

EMPLOYER: {{employer_name}}, a company incorporated under the laws of India, having its registered office at {{employer_address}} ("Company")

AND

EMPLOYEE: {{employee_name}}, residing at {{employee_address}} ("Employee")

1. POSITION AND DUTIES
The Employee is employed as {{job_title}} and shall report to {{reporting_manager}}.

2. COMPENSATION
The Employee shall receive a monthly salary of ₹{{monthly_salary}} subject to applicable tax deductions.

3. WORKING HOURS
Standard working hours are {{working_hours}} per week, Monday through Friday.

4. LEAVE POLICY
The Employee is entitled to {{annual_leave_days}} days of paid annual leave per year.

5. CONFIDENTIALITY
The Employee agrees to maintain confidentiality of all proprietary information.

6. TERMINATION
Either party may terminate this Agreement with {{notice_period}} days written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_____________________
{{employer_name}}
Date: {{signature_date}}

_____________________
{{employee_name}}
Date: {{signature_date}}',
'[{"name":"employer_name","label":"Employer Name","type":"text"},{"name":"employer_address","label":"Employer Address","type":"text"},{"name":"employee_name","label":"Employee Name","type":"text"},{"name":"employee_address","label":"Employee Address","type":"text"},{"name":"job_title","label":"Job Title","type":"text"},{"name":"reporting_manager","label":"Reporting Manager","type":"text"},{"name":"monthly_salary","label":"Monthly Salary (₹)","type":"number"},{"name":"working_hours","label":"Working Hours/Week","type":"number"},{"name":"annual_leave_days","label":"Annual Leave Days","type":"number"},{"name":"notice_period","label":"Notice Period (Days)","type":"number"},{"name":"effective_date","label":"Effective Date","type":"date"},{"name":"signature_date","label":"Signature Date","type":"date"}]',
'balanced', TRUE),

('Vendor Services Agreement', 'Standard vendor contract for procurement of services', 'vendor_contract',
'VENDOR SERVICES AGREEMENT

This Agreement is made on {{effective_date}} between:

CLIENT: {{client_name}}, {{client_address}} ("Client")
VENDOR: {{vendor_name}}, {{vendor_address}} ("Vendor")

1. SERVICES
The Vendor agrees to provide {{service_description}} as detailed in Schedule A.

2. TERM
This Agreement commences on {{start_date}} and continues until {{end_date}} unless terminated earlier.

3. COMPENSATION
The Client shall pay ₹{{contract_value}} as per the payment schedule in Schedule B.

4. DELIVERABLES
The Vendor shall deliver as per milestones defined in Schedule A.

5. WARRANTIES
The Vendor warrants that all services shall be performed in a professional manner.

6. INDEMNIFICATION
Each party shall indemnify the other against claims arising from its negligence.

7. TERMINATION
Either party may terminate with {{notice_days}} days written notice.

8. DISPUTE RESOLUTION
Disputes shall be resolved through arbitration in {{arbitration_city}}.

_____________________
{{client_name}}

_____________________
{{vendor_name}}',
'[{"name":"client_name","label":"Client Name","type":"text"},{"name":"client_address","label":"Client Address","type":"text"},{"name":"vendor_name","label":"Vendor Name","type":"text"},{"name":"vendor_address","label":"Vendor Address","type":"text"},{"name":"service_description","label":"Service Description","type":"textarea"},{"name":"contract_value","label":"Contract Value (₹)","type":"number"},{"name":"start_date","label":"Start Date","type":"date"},{"name":"end_date","label":"End Date","type":"date"},{"name":"notice_days","label":"Notice Period (Days)","type":"number"},{"name":"arbitration_city","label":"Arbitration City","type":"text"},{"name":"effective_date","label":"Effective Date","type":"date"}]',
'balanced', TRUE),

('Commercial Lease Agreement', 'Standard lease agreement for commercial property', 'lease_agreement',
'COMMERCIAL LEASE AGREEMENT

This Lease Agreement dated {{effective_date}} is between:

LESSOR: {{lessor_name}}, {{lessor_address}} ("Landlord")
LESSEE: {{lessee_name}}, {{lessee_address}} ("Tenant")

1. PREMISES
The Landlord leases to Tenant the property at {{property_address}} measuring {{area_sqft}} sq.ft.

2. TERM
The lease term is {{lease_months}} months, from {{start_date}} to {{end_date}}.

3. RENT
Monthly rent: ₹{{monthly_rent}}, payable by the {{payment_day}} of each month.

4. SECURITY DEPOSIT
Security deposit of ₹{{security_deposit}} to be paid upon signing.

5. PERMITTED USE
The premises shall be used only for {{permitted_use}}.

6. MAINTENANCE
Tenant shall maintain the premises in good condition.

7. TERMINATION
Termination requires {{notice_months}} months written notice.

8. RENEWAL
Renewal shall be negotiated {{renewal_notice_days}} days before expiry.

_____________________
{{lessor_name}}

_____________________
{{lessee_name}}',
'[{"name":"lessor_name","label":"Landlord Name","type":"text"},{"name":"lessor_address","label":"Landlord Address","type":"text"},{"name":"lessee_name","label":"Tenant Name","type":"text"},{"name":"lessee_address","label":"Tenant Address","type":"text"},{"name":"property_address","label":"Property Address","type":"text"},{"name":"area_sqft","label":"Area (sq.ft)","type":"number"},{"name":"lease_months","label":"Lease Term (Months)","type":"number"},{"name":"monthly_rent","label":"Monthly Rent (₹)","type":"number"},{"name":"security_deposit","label":"Security Deposit (₹)","type":"number"},{"name":"payment_day","label":"Payment Due Day","type":"number"},{"name":"permitted_use","label":"Permitted Use","type":"text"},{"name":"notice_months","label":"Termination Notice (Months)","type":"number"},{"name":"renewal_notice_days","label":"Renewal Notice (Days)","type":"number"},{"name":"start_date","label":"Start Date","type":"date"},{"name":"end_date","label":"End Date","type":"date"},{"name":"effective_date","label":"Effective Date","type":"date"}]',
'balanced', TRUE);