import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Save, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContractTemplate } from '@/types/legal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateUserTemplate } from '@/hooks/useTemplates';
import { useCreateAuditEntry } from '@/hooks/useAuditTrail';
import { toast } from 'sonner';

interface TemplateCustomizerProps {
  template: ContractTemplate;
  open: boolean;
  onClose: () => void;
}

export function TemplateCustomizer({ template, open, onClose }: TemplateCustomizerProps) {
  const { t } = useLanguage();
  const createUserTemplate = useCreateUserTemplate();
  const createAuditEntry = useCreateAuditEntry();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const filledContent = template.content.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => values[key] || match
  );

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await createUserTemplate.mutateAsync({
        template_id: template.id,
        name: `${template.name} - Custom`,
        content: filledContent,
        variables_filled: values,
      });
      await createAuditEntry.mutateAsync({
        action: 'template_generated',
        action_details: { template_name: template.name },
      });
      toast.success(t('Template saved to your library!', 'टेम्पलेट आपकी लाइब्रेरी में सहेजा गया!'));
      onClose();
    } catch (error) {
      toast.error(t('Failed to save template', 'टेम्पलेट सहेजने में विफल'));
    }
  };

  const handleDownload = (format: 'txt' | 'docx') => {
    const blob = new Blob([filledContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('Template downloaded!', 'टेम्पलेट डाउनलोड हो गया!'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Form */}
          <div className="w-1/2 flex flex-col">
            <h3 className="font-medium mb-4">{t('Fill in the details', 'विवरण भरें')}</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {template.variables.map((variable) => (
                  <div key={variable.name}>
                    <Label htmlFor={variable.name}>{variable.label}</Label>
                    {variable.type === 'textarea' ? (
                      <Textarea
                        id={variable.name}
                        value={values[variable.name] || ''}
                        onChange={(e) => handleChange(variable.name, e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type === 'date' ? 'date' : variable.type === 'number' ? 'number' : 'text'}
                        value={values[variable.name] || ''}
                        onChange={(e) => handleChange(variable.name, e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview */}
          <div className="w-1/2 flex flex-col border-l pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{t('Preview', 'पूर्वावलोकन')}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? t('Hide', 'छिपाएं') : t('Show', 'दिखाएं')}
              </Button>
            </div>
            <ScrollArea className="flex-1 bg-muted/30 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {filledContent}
              </pre>
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => handleDownload('txt')}>
            <FileDown className="h-4 w-4 mr-2" />
            {t('Download TXT', 'TXT डाउनलोड करें')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t('Save to Library', 'लाइब्रेरी में सहेजें')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
