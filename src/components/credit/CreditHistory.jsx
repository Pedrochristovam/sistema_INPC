import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function CreditHistory({ records, isLoading, onSelect }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Nenhuma consulta realizada ainda</p>
      </div>
    );
  }

  const handleCopy = async (text, e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-3">
      {records.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:shadow-lg 
                     transition-all cursor-pointer group"
          onClick={() => onSelect && onSelect(record)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="font-semibold text-slate-900 text-base mb-1">
                  Processo: {record.process_number}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="font-medium">{record.debtor_name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(record.received_value)}
                  </span>
                </span>
                {record.receipt_date && (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-slate-600" />
                    </div>
                    <span className="font-medium">
                      {format(new Date(record.receipt_date), 'dd/MM/yyyy')}
                    </span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                Criado em {format(new Date(record.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleCopy(record.generated_text, e)}
              className="text-slate-500 hover:text-indigo-600 h-9 w-9 p-0 flex-shrink-0
                         hover:bg-indigo-50 transition-colors"
              aria-label="Copiar texto"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
