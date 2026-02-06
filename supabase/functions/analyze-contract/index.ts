import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contractId } = await req.json();

    // Fetch contract
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .eq("user_id", user.id)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download contract file
    const { data: fileData, error: fileError } = await supabase.storage
      .from("contracts")
      .download(contract.file_path);

    if (fileError) {
      throw new Error("Failed to download contract file");
    }

    const contractText = await fileData.text();

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert Indian legal analyst specializing in contract law for SMEs. Analyze contracts and provide:
1. Contract type identification
2. Key parties involved
3. Clause-by-clause analysis with risk assessment
4. Plain language explanations suitable for business owners
5. Compliance flags for Indian laws
6. Alternative clause suggestions
7. Negotiation scripts

Respond in JSON format with this structure:
{
  "contract_type": "employment_agreement|vendor_contract|lease_agreement|partnership_deed|service_contract|other",
  "parties": [{"name": "...", "role": "..."}],
  "jurisdiction": "...",
  "effective_date": "YYYY-MM-DD or null",
  "expiry_date": "YYYY-MM-DD or null",
  "composite_risk_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "executive_summary": "3-4 sentence summary in plain business English",
  "clauses": [
    {
      "clause_number": 1,
      "original_text": "...",
      "plain_explanation": "...",
      "risk_rationale": "...",
      "risk_score": 0-100,
      "risk_level": "low|medium|high|critical",
      "category": "obligations|rights|prohibitions|termination|indemnity|liability|confidentiality|ip_transfer|non_compete|auto_renewal|payment|dispute_resolution|other",
      "suggested_alternative": "...",
      "negotiation_script": "...",
      "compliance_flags": [{"issue": "...", "law_reference": "...", "severity": "low|medium|high|critical"}]
    }
  ]
}`
          },
          {
            role: "user",
            content: `Analyze this contract:\n\n${contractText.slice(0, 15000)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    // Update contract with analysis results
    await supabase
      .from("contracts")
      .update({
        contract_type: analysis.contract_type,
        parties: analysis.parties,
        jurisdiction: analysis.jurisdiction,
        effective_date: analysis.effective_date,
        expiry_date: analysis.expiry_date,
        composite_risk_score: analysis.composite_risk_score,
        risk_level: analysis.risk_level,
        executive_summary: analysis.executive_summary,
        analysis_status: "completed",
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", contractId);

    // Insert clauses
    if (analysis.clauses?.length > 0) {
      // Delete existing clauses first
      await supabase.from("clauses").delete().eq("contract_id", contractId);
      
      // Insert new clauses
      await supabase.from("clauses").insert(
        analysis.clauses.map((clause: any) => ({
          contract_id: contractId,
          clause_number: clause.clause_number,
          original_text: clause.original_text,
          plain_explanation: clause.plain_explanation,
          risk_rationale: clause.risk_rationale,
          risk_score: clause.risk_score,
          risk_level: clause.risk_level,
          category: clause.category,
          suggested_alternative: clause.suggested_alternative,
          negotiation_script: clause.negotiation_script,
          compliance_flags: clause.compliance_flags || [],
        }))
      );
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
