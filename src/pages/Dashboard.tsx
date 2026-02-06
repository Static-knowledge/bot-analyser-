import { AppLayout } from '@/components/layout/AppLayout';
import { UploadCard } from '@/components/contracts/UploadCard';
import { ContractCard } from '@/components/contracts/ContractCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useContracts } from '@/hooks/useContracts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Files, MessageSquare, GitCompare, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: contracts, isLoading } = useContracts();
  const { t } = useLanguage();

  const recentContracts = contracts?.slice(0, 6) || [];
  const latestAnalyzed = contracts?.find(c => c.analysis_status === 'completed');

  const stats = {
    total: contracts?.length || 0,
    analyzed: contracts?.filter(c => c.analysis_status === 'completed').length || 0,
    highRisk: contracts?.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length || 0,
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('Dashboard', 'डैशबोर्ड')}</h1>
            <p className="text-muted-foreground">{t('Upload and analyze your contracts', 'अपने अनुबंध अपलोड और विश्लेषण करें')}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Card */}
          <div className="lg:col-span-2">
            <UploadCard />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('Quick Actions', 'त्वरित क्रियाएं')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/templates">
                  <Files className="mr-2 h-4 w-4" />
                  {t('Generate Template', 'टेम्पलेट जनरेट करें')}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/glossary">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('Legal Glossary', 'कानूनी शब्दकोश')}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/risk">
                  <GitCompare className="mr-2 h-4 w-4" />
                  {t('Risk Dashboard', 'जोखिम डैशबोर्ड')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Contracts', 'कुल अनुबंध')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.analyzed}</p>
                  <p className="text-sm text-muted-foreground">{t('Analyzed', 'विश्लेषित')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{stats.highRisk}</p>
                  <p className="text-sm text-muted-foreground">{t('High Risk', 'उच्च जोखिम')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contracts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('Recent Contracts', 'हाल के अनुबंध')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/clauses">{t('View all', 'सभी देखें')}</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentContracts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentContracts.map(contract => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t('No contracts yet. Upload your first contract above!', 'अभी तक कोई अनुबंध नहीं। ऊपर अपना पहला अनुबंध अपलोड करें!')}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Executive Summary */}
        {latestAnalyzed?.executive_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('Latest Analysis Summary', 'नवीनतम विश्लेषण सारांश')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{latestAnalyzed.executive_summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
