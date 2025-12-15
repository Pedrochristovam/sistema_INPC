import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, FileSearch, Upload } from 'lucide-react';
import FileUploadZone from '../ui/FileUploadZone';
import { motion } from 'framer-motion';

export default function CreditForm({ onSubmit, isProcessing }) {
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (files.length === 0) return;

    onSubmit(files[0]);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Selecione o Anexo</h3>
            <p className="text-xs text-slate-600 mt-1">Anexo 03 ou 04 (PDF ou Excel)</p>
          </div>
        </div>
        
        <FileUploadZone
          files={files}
          setFiles={setFiles}
          accept=".xlsx,.xls,.pdf"
          multiple={false}
          maxFiles={1}
          label="Arraste o arquivo ou clique para selecionar"
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={files.length === 0 || isProcessing}
          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 
                     hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold
                     rounded-lg shadow-md shadow-indigo-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Extraindo dados...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Processar Anexo
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
