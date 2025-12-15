import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Percent, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import FileUploadZone from '../ui/FileUploadZone';
import { motion } from 'framer-motion';

export default function INPCForm({ onSubmit, isProcessing }) {
  const [inpcValue, setInpcValue] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [planilhaA, setPlanilhaA] = useState([]);
  const [planilhaB, setPlanilhaB] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inpcValue || !monthYear || planilhaA.length === 0 || planilhaB.length === 0) {
      return;
    }

    onSubmit({
      inpcValue: parseFloat(inpcValue.replace(',', '.')),
      monthYear,
      processNumber: processNumber.trim(),
      planilhaA: planilhaA[0],
      planilhaB: planilhaB[0]
    });
  };

  const isValid = inpcValue && monthYear && planilhaA.length > 0 && planilhaB.length > 0;

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* INPC Input Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Informações do Índice</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                Índice INPC (%)
              </Label>
              <Input
                type="text"
                placeholder="Ex: 0,52"
                value={inpcValue}
                onChange={(e) => setInpcValue(e.target.value)}
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
              <p className="text-xs text-slate-500">Informe o valor percentual do índice INPC</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Mês/Ano de Referência
              </Label>
              <Input
                type="month"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
              <p className="text-xs text-slate-500">Selecione o mês e ano de referência</p>
            </div>
          </div>
        </div>
        
        {/* Process Number Section */}
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Informações do Processo</h3>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Nº de Processo
            </Label>
            <Input
              type="text"
              placeholder="Ex: 44076025320078130024"
              value={processNumber}
              onChange={(e) => setProcessNumber(e.target.value)}
              className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
            />
            <p className="text-xs text-slate-500">Informe o número do processo para verificação nas planilhas (opcional)</p>
          </div>
        </div>
      </div>

      {/* File Upload Sections */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Upload de Planilhas</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <Label className="text-sm font-semibold text-slate-800">Planilha A</Label>
              </div>
              <FileUploadZone
                files={planilhaA}
                setFiles={setPlanilhaA}
                accept=".xlsx,.xls"
                multiple={false}
                maxFiles={1}
                label="Arraste ou clique para selecionar"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                </div>
                <Label className="text-sm font-semibold text-slate-800">Planilha B</Label>
              </div>
              <FileUploadZone
                files={planilhaB}
                setFiles={setPlanilhaB}
                accept=".xlsx,.xls"
                multiple={false}
                maxFiles={1}
                label="Arraste ou clique para selecionar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={!isValid || isProcessing}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white font-semibold
                     rounded-lg shadow-md shadow-blue-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando planilhas...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Processar Atualização INPC
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
