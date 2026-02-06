import { motion } from 'framer-motion';
import { Files, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractTemplate } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';

interface TemplateCardProps {
  template: ContractTemplate;
  onCustomize: (template: ContractTemplate) => void;
}

const contractTypeLabels: Record<string, { en: string; hi: string }> = {
  employment_agreement: { en: 'Employment Agreement', hi: 'रोजगार समझौता' },
  vendor_contract: { en: 'Vendor Contract', hi: 'विक्रेता अनुबंध' },
  lease_agreement: { en: 'Lease Agreement', hi: 'पट्टा समझौता' },
  partnership_deed: { en: 'Partnership Deed', hi: 'साझेदारी विलेख' },
  service_contract: { en: 'Service Contract', hi: 'सेवा अनुबंध' },
  other: { en: 'Other', hi: 'अन्य' },
};

const riskPostureLabels: Record<string, { en: string; hi: string; color: string }> = {
  conservative: { en: 'Conservative', hi: 'रूढ़िवादी', color: 'text-success' },
  balanced: { en: 'Balanced', hi: 'संतुलित', color: 'text-warning' },
  aggressive: { en: 'Aggressive', hi: 'आक्रामक', color: 'text-destructive' },
};

export function TemplateCard({ template, onCustomize }: TemplateCardProps) {
  const { language, t } = useLanguage();

  const typeLabel = contractTypeLabels[template.contract_type] || contractTypeLabels.other;
  const riskPosture = riskPostureLabels[template.risk_posture] || riskPostureLabels.balanced;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardContent className="flex-1 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Files className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold line-clamp-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en' ? typeLabel.en : typeLabel.hi}
              </p>
            </div>
          </div>

          {template.description && (
            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
              {template.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${riskPosture.color}`}>
              {language === 'en' ? riskPosture.en : riskPosture.hi}
            </span>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {template.variables.length} {t('customizable fields', 'अनुकूलन योग्य फ़ील्ड')}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button className="w-full" onClick={() => onCustomize(template)}>
            {t('Customize', 'अनुकूलित करें')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
