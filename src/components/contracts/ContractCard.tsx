import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, MoreVertical, Eye, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Contract } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDeleteContract } from '@/hooks/useContracts';
import { useAnalyzeContract } from '@/hooks/useContractAnalysis';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ContractCardProps {
  contract: Contract;
}

const contractTypeLabels: Record<string, { en: string; hi: string }> = {
  employment_agreement: { en: 'Employment', hi: 'रोजगार' },
  vendor_contract: { en: 'Vendor', hi: 'विक्रेता' },
  lease_agreement: { en: 'Lease', hi: 'पट्टा' },
  partnership_deed: { en: 'Partnership', hi: 'साझेदारी' },
  service_contract: { en: 'Service', hi: 'सेवा' },
  other: { en: 'Other', hi: 'अन्य' },
};

export function ContractCard({ contract }: ContractCardProps) {
  const { language, t } = useLanguage();
  const deleteContract = useDeleteContract();
  const analyzeContract = useAnalyzeContract();

  const typeLabel = contractTypeLabels[contract.contract_type] || contractTypeLabels.other;
  const timeAgo = formatDistanceToNow(new Date(contract.created_at), { addSuffix: true });

  const handleDelete = async () => {
    if (confirm(t('Are you sure you want to delete this contract?', 'क्या आप इस अनुबंध को हटाना चाहते हैं?'))) {
      try {
        await deleteContract.mutateAsync(contract.id);
        toast.success(t('Contract deleted', 'अनुबंध हटाया गया'));
      } catch (error) {
        toast.error(t('Failed to delete contract', 'अनुबंध हटाने में विफल'));
      }
    }
  };

  const handleReanalyze = async () => {
    try {
      toast.info(t('Re-analyzing contract...', 'अनुबंध का पुनः विश्लेषण हो रहा है...'));
      await analyzeContract.mutateAsync(contract.id);
      toast.success(t('Analysis complete!', 'विश्लेषण पूर्ण!'));
    } catch (error) {
      toast.error(t('Analysis failed', 'विश्लेषण विफल'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <Link
                  to={`/clauses?contract=${contract.id}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {contract.file_name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-secondary rounded text-xs">
                    {language === 'en' ? typeLabel.en : typeLabel.hi}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {contract.analysis_status === 'completed' ? (
                <RiskBadge
                  level={contract.risk_level}
                  score={contract.composite_risk_score}
                  size="sm"
                />
              ) : contract.analysis_status === 'analyzing' ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  {t('Analyzing...', 'विश्लेषण...')}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t('Pending', 'लंबित')}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/clauses?contract=${contract.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('View Details', 'विवरण देखें')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReanalyze}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('Re-analyze', 'पुनः विश्लेषण')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    {t('Export Report', 'रिपोर्ट निर्यात')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('Delete', 'हटाएं')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {contract.executive_summary && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {contract.executive_summary}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
