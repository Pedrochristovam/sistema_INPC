import React, { useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUploadZone({ 
  files, 
  setFiles, 
  accept = ".xlsx,.xls,.pdf",
  multiple = true,
  label = "Arraste arquivos ou clique para selecionar",
  maxFiles = 2
}) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['xlsx', 'xls', 'pdf'].includes(ext);
    });
    
    if (multiple) {
      setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  }, [multiple, maxFiles, setFiles]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (multiple) {
      setFiles(prev => [...prev, ...selectedFiles].slice(0, maxFiles));
    } else {
      setFiles(selectedFiles.slice(0, 1));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    return '📊';
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative border-2 border-dashed rounded-xl p-8
                   transition-all duration-200 cursor-pointer group
                   ${files.length > 0 
                     ? 'border-emerald-300 bg-emerald-50/50' 
                     : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                   }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4
                          transition-transform duration-200
                          ${files.length > 0
                            ? 'bg-emerald-100'
                            : 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:scale-105'
                          }`}>
            {files.length > 0 ? (
              <File className="w-8 h-8 text-emerald-600" />
            ) : (
              <Upload className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
          <p className="text-xs text-slate-500">
            Formatos aceitos: {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white 
                           border border-slate-200 rounded-xl shadow-sm
                           hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{getFileIcon(file.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate mb-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Remover arquivo"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
