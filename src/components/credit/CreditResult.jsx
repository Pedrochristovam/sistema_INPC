import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileDown, Check, Edit3, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function CreditResult({ data, onSave, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const generateText = (d) => {
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(d.received_value);

    const formattedDate = d.receipt_date 
      ? format(new Date(d.receipt_date), 'dd/MM/yyyy')
      : '__/__/____';

    return `Assunto: Identificação de crédito – Processo: ${d.process_number}

Prezado Procurador,

CL ${d.cl_number || 'XX.XXX'} – ${d.debtor_name}

Considerando o recebimento pela MGI do valor de ${formattedValue} em ${formattedDate} do processo/parte em referência, solicito os préstimos de V.Sa. para informar:

- Origem do recurso;
- Destino do recurso;
- Recuperação parcial ou total do CL.`;
  };

  const generatedText = generateText(isEditing ? editData : data);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Identificação de Crédito - ${data.process_number}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.8; }
            h1 { font-size: 14pt; margin-bottom: 30px; }
            p { margin: 20px 0; }
            ul { margin-left: 20px; }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif;">${generatedText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveEdit = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Extracted Data Display */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Dados Extraídos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Nº do Processo
            </Label>
            {isEditing ? (
              <Input
                value={editData.process_number}
                onChange={(e) => setEditData({ ...editData, process_number: e.target.value })}
                className="h-11 border-slate-200 focus:border-indigo-500"
              />
            ) : (
              <p className="text-base font-semibold text-slate-900 py-2">{data.process_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Nome do Devedor
            </Label>
            {isEditing ? (
              <Input
                value={editData.debtor_name}
                onChange={(e) => setEditData({ ...editData, debtor_name: e.target.value })}
                className="h-11 border-slate-200 focus:border-indigo-500"
              />
            ) : (
              <p className="text-base font-semibold text-slate-900 py-2">{data.debtor_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Número do CL
            </Label>
            {isEditing ? (
              <Input
                value={editData.cl_number || ''}
                onChange={(e) => setEditData({ ...editData, cl_number: e.target.value })}
                className="h-11 border-slate-200 focus:border-indigo-500"
                placeholder="XX.XXX"
              />
            ) : (
              <p className="text-base font-semibold text-slate-900 py-2">
                {data.cl_number || 'Não informado'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Valor Recebido
            </Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={editData.received_value}
                onChange={(e) => setEditData({ ...editData, received_value: parseFloat(e.target.value) })}
                className="h-11 border-slate-200 focus:border-indigo-500"
              />
            ) : (
              <p className="text-base font-semibold text-slate-900 py-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.received_value)}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Data de Recebimento
            </Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.receipt_date}
                onChange={(e) => setEditData({ ...editData, receipt_date: e.target.value })}
                className="h-11 border-slate-200 focus:border-indigo-500"
              />
            ) : (
              <p className="text-base font-semibold text-slate-900 py-2">
                {data.receipt_date ? format(new Date(data.receipt_date), 'dd/MM/yyyy') : 'Não informado'}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-slate-200">
            <Button onClick={handleSaveEdit} className="w-full h-11">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      {/* Generated Text */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-slate-900">Texto Gerado para AGE</Label>
        </div>
        <div className="relative">
          <Textarea
            value={generatedText}
            readOnly
            className="min-h-[320px] font-mono text-sm bg-white border-slate-200 
                       rounded-xl resize-none p-4 leading-relaxed"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
        <Button
          onClick={handleCopy}
          className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 
                     hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-500/20"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copiar Texto
            </>
          )}
        </Button>

        <Button
          onClick={handleExportPDF}
          variant="outline"
          className="flex-1 h-12 border-slate-300 hover:bg-slate-50"
        >
          <FileDown className="w-5 h-5 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Save Button */}
      <Button
        onClick={() => onSave({ ...data, generated_text: generatedText })}
        variant="outline"
        className="w-full h-12 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold"
      >
        Salvar no Histórico
      </Button>
    </motion.div>
  );
}
