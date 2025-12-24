import { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { validateCsvFile } from '@/lib/csvUtils';
import { ImportType, getImportTypeLabel } from '@/lib/importUtils';

interface ImportFileUploadProps {
  importType: ImportType;
  onFileSelect: (file: File, content: string) => void;
}

export function ImportFileUpload({ importType, onFileSelect }: ImportFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    const validation = validateCsvFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      const content = await file.text();
      if (!content.trim()) {
        setError('File is empty');
        return;
      }
      setSelectedFile(file);
      onFileSelect(file, content);
    } catch (e) {
      setError('Failed to read file');
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Upload {getImportTypeLabel(importType)} CSV</h2>
        <p className="text-muted-foreground">
          Upload a CSV file containing your {getImportTypeLabel(importType).toLowerCase()} data
        </p>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : selectedFile 
            ? 'border-green-500 bg-green-500/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleInputChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer text-center">
            {selectedFile ? (
              <>
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-green-600">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Choose Different File
                </Button>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Select File
                </Button>
              </>
            )}
          </label>
        </CardContent>
      </Card>

      {error && (
        <InlineAlert variant="destructive">{error}</InlineAlert>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-medium mb-2">CSV Format Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• First row should contain column headers</li>
          <li>• Common formats like Excel exports work great</li>
          <li>• Maximum file size: 5MB</li>
          {importType === 'transactions' && (
            <li>• Include columns for date, description, and amount</li>
          )}
          {importType === 'expenses' && (
            <li>• Include columns for name and planned amount</li>
          )}
          {importType === 'debts' && (
            <li>• Include columns for name, balance, APR, and minimum payment</li>
          )}
        </ul>
      </div>
    </div>
  );
}
