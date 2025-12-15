import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, CheckCircle, AlertCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function INPCHistory({ updates, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Nenhuma atualização realizada ainda</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="space-y-3">
      {updates.map((update, index) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className={`p-4 rounded-xl border ${getStatusColor(update.status)} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(update.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-base mb-1">
                  {update.month_year}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  INPC: {update.inpc_value?.toFixed(2).replace('.', ',')}%
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(update.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            {update.status === 'completed' && (
              <div className="flex gap-2 flex-shrink-0">
                {update.planilha_a_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3"
                    onClick={() => window.open(update.planilha_a_url, '_blank')}
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    A
                  </Button>
                )}
                {update.planilha_b_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3"
                    onClick={() => window.open(update.planilha_b_url, '_blank')}
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    B
                  </Button>
                )}
              </div>
            )}
          </div>

          {update.status === 'error' && update.error_message && (
            <p className="mt-3 text-sm text-red-600 pt-3 border-t border-red-200">
              {update.error_message}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
