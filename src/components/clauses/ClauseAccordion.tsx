import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Pin, Download, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Clause } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdateClause } from '@/hooks/useClauses';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClauseAccordionProps {
  clause: Clause;
  isOpen: boolean;
  onToggle: () => void;
}

const categoryLabels: Record<string, { en: string; hi: string }> = {
  obligations: { en: 'Obligations', hi: 'दायित्व' },
  rights: { en: 'Rights', hi: 'अधिकार' },
  prohibitions: { en: 'Prohibitions', hi: 'निषेध' },
  termination: { en: 'Termination', hi: 'समाप्ति' },
  indemnity: { en: 'Indemnity', hi: 'क्षतिपूर्ति' },
  liability: { en: 'Liability', hi: 'देयता' },
  confidentiality: { en: 'Confidentiality', hi: 'गोपनीयता' },
  ip_transfer: { en: 'IP Transfer', hi: 'आईपी हस्तांतरण' },
  non_compete: { en: 'Non-Compete', hi: 'गैर-प्रतिस्पर्धा' },
  auto_renewal: { en: 'Auto-Renewal', hi: 'स्वतः नवीनीकरण' },
  payment: { en: 'Payment', hi: 'भुगतान' },
  dispute_resolution: { en: 'Dispute Resolution', hi: 'विवाद समाधान' },
  other: { en: 'Other', hi: 'अन्य' },
};

export function ClauseAccordion({ clause, isOpen, onToggle }: ClauseAccordionProps) {
  const { language, t } = useLanguage();
  const updateClause = useUpdateClause();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlternative, setEditedAlternative] = useState(clause.suggested_alternative || '');

  const categoryLabel = categoryLabels[clause.category] || categoryLabels.other;

  const handleSaveAlternative = async () => {
    try {
      await updateClause.mutateAsync({
        id: clause.id,
        contract_id: clause.contract_id,
        suggested_alternative: editedAlternative,
      });
      setIsEditing(false);
      toast.success(t('Alternative clause saved', 'वैकल्पिक खंड सहेजा गया'));
    } catch (error) {
      toast.error(t('Failed to save', 'सहेजने में विफल'));
    }
  };

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden transition-colors',
      clause.is_flagged && 'border-warning/50 bg-warning/5',
      clause.risk_level === 'critical' && 'border-destructive/50 bg-destructive/5'
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {clause.clause_number}
          </span>
          <div className="min-w-0">
            <p className="font-medium truncate">{clause.original_text.slice(0, 80)}...</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                {language === 'en' ? categoryLabel.en : categoryLabel.hi}
              </span>
              <RiskBadge level={clause.risk_level} size="sm" showLabel={false} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <Pin className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <Download className="h-4 w-4" />
          </Button>
          <ChevronDown
            className={cn('h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4 border-t">
              {/* Original Text */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('Original Clause', 'मूल खंड')}</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{clause.original_text}</p>
              </div>

              {/* Plain Explanation */}
              {clause.plain_explanation && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    {t('What this means in plain language', 'सरल भाषा में इसका अर्थ')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{clause.plain_explanation}</p>
                </div>
              )}

              {/* Risk Rationale */}
              {clause.risk_rationale && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    {t('Risk Analysis', 'जोखिम विश्लेषण')}
                    <RiskBadge level={clause.risk_level} score={clause.risk_score} size="sm" />
                  </h4>
                  <p className="text-sm text-muted-foreground">{clause.risk_rationale}</p>
                </div>
              )}

              {/* Suggested Alternative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">
                    {t('Suggested Alternative', 'सुझाया गया विकल्प')}
                  </h4>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      {t('Edit', 'संपादित करें')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveAlternative}>
                        <Check className="h-4 w-4 mr-1" />
                        {t('Apply', 'लागू करें')}
                      </Button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedAlternative}
                    onChange={(e) => setEditedAlternative(e.target.value)}
                    className="min-h-[100px]"
                    placeholder={t('Enter alternative clause text...', 'वैकल्पिक खंड टेक्स्ट दर्ज करें...')}
                  />
                ) : (
                  <p className="text-sm bg-success/10 text-success-foreground p-3 rounded-lg border border-success/20">
                    {clause.suggested_alternative || t('No alternative suggested', 'कोई विकल्प सुझाया नहीं गया')}
                  </p>
                )}
              </div>

              {/* Negotiation Script */}
              {clause.negotiation_script && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    {t('Negotiation Script', 'वार्ता स्क्रिप्ट')}
                  </h4>
                  <p className="text-sm italic text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                    "{clause.negotiation_script}"
                  </p>
                </div>
              )}

              {/* Compliance Flags */}
              {clause.compliance_flags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    {t('Compliance Issues', 'अनुपालन मुद्दे')}
                  </h4>
                  <ul className="space-y-2">
                    {clause.compliance_flags.map((flag, index) => (
                      <li
                        key={index}
                        className={cn(
                          'text-sm p-2 rounded-lg border',
                          flag.severity === 'low' && 'bg-success/10 border-success/20',
                          flag.severity === 'medium' && 'bg-warning/10 border-warning/20',
                          (flag.severity === 'high' || flag.severity === 'critical') && 'bg-destructive/10 border-destructive/20'
                        )}
                      >
                        <span className="font-medium">{flag.issue}</span>
                        {flag.law_reference && (
                          <span className="text-muted-foreground"> — {flag.law_reference}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Similarity Score */}
              {clause.similarity_score > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('Template Similarity:', 'टेम्पलेट समानता:')}</span>
                  <span className="font-medium">{clause.similarity_score}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
