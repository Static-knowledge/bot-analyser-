import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, File, X, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateContract } from '@/hooks/useContracts';
import { useAnalyzeContract } from '@/hooks/useContractAnalysis';
import { useCreateAuditEntry } from '@/hooks/useAuditTrail';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadCard() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const createContract = useCreateContract();
  const analyzeContract = useAnalyzeContract();
  const createAuditEntry = useCreateAuditEntry();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        toast.error(t('Please sign in to upload contracts', 'अनुबंध अपलोड करने के लिए साइन इन करें'));
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload to storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(filePath, file);

        clearInterval(progressInterval);

        if (uploadError) throw uploadError;

        setUploadProgress(95);

        // Create contract record
        const contract = await createContract.mutateAsync({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        });

        // Create audit entry
        await createAuditEntry.mutateAsync({
          contract_id: contract.id,
          action: 'upload',
          action_details: { file_name: file.name, file_size: file.size },
        });

        setUploadProgress(100);
        setUploadedFile(file.name);

        toast.success(t('Contract uploaded successfully!', 'अनुबंध सफलतापूर्वक अपलोड हो गया!'));

        // Start analysis
        toast.info(t('Starting AI analysis...', 'AI विश्लेषण शुरू हो रहा है...'));
        await analyzeContract.mutateAsync(contract.id);
        toast.success(t('Analysis complete!', 'विश्लेषण पूर्ण!'));

        // Reset after delay
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          setUploadedFile(null);
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(t('Failed to upload contract', 'अनुबंध अपलोड करने में विफल'));
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [user, createContract, analyzeContract, createAuditEntry, t]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          {t('Upload Contract', 'अनुबंध अपलोड करें')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {uploadProgress < 100 ? (
                  <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                ) : (
                  <CheckCircle className="h-10 w-10 mx-auto text-success" />
                )}
                <div>
                  <p className="font-medium">
                    {uploadProgress < 100
                      ? t('Uploading...', 'अपलोड हो रहा है...')
                      : t('Upload complete!', 'अपलोड पूर्ण!')}
                  </p>
                  {uploadedFile && (
                    <p className="text-sm text-muted-foreground mt-1">{uploadedFile}</p>
                  )}
                </div>
                <Progress value={uploadProgress} className="max-w-xs mx-auto" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-center gap-3 text-muted-foreground">
                  <FileText className="h-10 w-10" />
                  <File className="h-10 w-10" />
                </div>
                <div>
                  <p className="font-medium">
                    {isDragActive
                      ? t('Drop your contract here', 'अपना अनुबंध यहां छोड़ें')
                      : t('Drag & drop your contract', 'अपना अनुबंध यहां खींचें')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('or click to browse', 'या ब्राउज़ करने के लिए क्लिक करें')}
                  </p>
                </div>
                <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-secondary rounded">PDF</span>
                  <span className="px-2 py-1 bg-secondary rounded">DOCX</span>
                  <span className="px-2 py-1 bg-secondary rounded">DOC</span>
                  <span className="px-2 py-1 bg-secondary rounded">TXT</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {fileRejections.length > 0 && (
          <p className="text-sm text-destructive mt-2">
            {t('Invalid file. Please upload a PDF, DOC, DOCX, or TXT file under 10MB.',
              'अमान्य फ़ाइल। कृपया 10MB से कम PDF, DOC, DOCX, या TXT फ़ाइल अपलोड करें।')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
