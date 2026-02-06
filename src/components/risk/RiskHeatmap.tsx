import { motion } from 'framer-motion';
import { Clause, RiskLevel } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RiskHeatmapProps {
  clauses: Clause[];
  onClauseClick?: (clause: Clause) => void;
}

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-destructive',
  critical: 'bg-destructive',
};

const categoryLabels: Record<string, string> = {
  obligations: 'Obligations',
  rights: 'Rights',
  prohibitions: 'Prohibitions',
  termination: 'Termination',
  indemnity: 'Indemnity',
  liability: 'Liability',
  confidentiality: 'Confidentiality',
  ip_transfer: 'IP Transfer',
  non_compete: 'Non-Compete',
  auto_renewal: 'Auto-Renewal',
  payment: 'Payment',
  dispute_resolution: 'Dispute Resolution',
  other: 'Other',
};

export function RiskHeatmap({ clauses, onClauseClick }: RiskHeatmapProps) {
  const { t } = useLanguage();

  // Group clauses by category
  const clausesByCategory = clauses.reduce((acc, clause) => {
    const category = clause.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(clause);
    return acc;
  }, {} as Record<string, Clause[]>);

  const categories = Object.keys(clausesByCategory);
  const maxClauses = Math.max(...Object.values(clausesByCategory).map(c => c.length));

  if (clauses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t('No clauses to display', 'प्रदर्शित करने के लिए कोई खंड नहीं')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{t('Risk Heatmap', 'जोखिम हीटमैप')}</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span>{t('Low', 'कम')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning" />
            <span>{t('Medium', 'मध्यम')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span>{t('High/Critical', 'उच्च/गंभीर')}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: categoryIndex * 0.05 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="w-32 text-sm font-medium truncate">
                {categoryLabels[category] || category}
              </div>
              <div className="flex gap-1 flex-1">
                {clausesByCategory[category].map((clause, index) => (
                  <Tooltip key={clause.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: categoryIndex * 0.05 + index * 0.02 }}
                        onClick={() => onClauseClick?.(clause)}
                        className={cn(
                          'w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium transition-transform hover:scale-110 cursor-pointer',
                          riskColors[clause.risk_level],
                          clause.risk_level === 'critical' && 'animate-pulse'
                        )}
                      >
                        {clause.clause_number}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">Clause {clause.clause_number}</p>
                      <p className="text-xs text-muted-foreground max-w-xs truncate">
                        {clause.original_text.slice(0, 100)}...
                      </p>
                      <p className="text-xs mt-1">Risk Score: {clause.risk_score}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
