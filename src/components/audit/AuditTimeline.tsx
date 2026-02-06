import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  Download,
  FilePlus,
  Edit,
  Copy,
} from 'lucide-react';
import { AuditEntry, AuditAction } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow, format } from 'date-fns';

interface AuditTimelineProps {
  entries: AuditEntry[];
}

const actionIcons: Record<AuditAction, typeof Upload> = {
  upload: Upload,
  analyze: Search,
  export: Download,
  template_generated: FilePlus,
  clause_edited: Edit,
  version_created: Copy,
};

const actionLabels: Record<AuditAction, { en: string; hi: string }> = {
  upload: { en: 'Contract Uploaded', hi: 'अनुबंध अपलोड किया गया' },
  analyze: { en: 'Analysis Completed', hi: 'विश्लेषण पूर्ण' },
  export: { en: 'Report Exported', hi: 'रिपोर्ट निर्यात की गई' },
  template_generated: { en: 'Template Generated', hi: 'टेम्पलेट जेनरेट किया गया' },
  clause_edited: { en: 'Clause Edited', hi: 'खंड संपादित किया गया' },
  version_created: { en: 'Version Created', hi: 'संस्करण बनाया गया' },
};

const actionColors: Record<AuditAction, string> = {
  upload: 'bg-primary',
  analyze: 'bg-success',
  export: 'bg-warning',
  template_generated: 'bg-primary',
  clause_edited: 'bg-warning',
  version_created: 'bg-muted-foreground',
};

export function AuditTimeline({ entries }: AuditTimelineProps) {
  const { language, t } = useLanguage();

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t('No audit entries yet', 'अभी तक कोई ऑडिट प्रविष्टियां नहीं')}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const Icon = actionIcons[entry.action];
          const label = actionLabels[entry.action];
          const colorClass = actionColors[entry.action];

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-10"
            >
              {/* Icon */}
              <div
                className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>

              {/* Content */}
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {language === 'en' ? label.en : label.hi}
                    </p>
                    {entry.action_details && Object.keys(entry.action_details).length > 0 && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {Object.entries(entry.action_details).map(([key, value]) => (
                          <span key={key} className="block">
                            {key.replace(/_/g, ' ')}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    <p>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</p>
                    <p className="text-xs">{format(new Date(entry.created_at), 'PPp')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
