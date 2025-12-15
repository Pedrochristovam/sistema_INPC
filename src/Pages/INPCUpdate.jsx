import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, History, AlertCircle, Download, Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import INPCForm from '@/components/inpc/INPCForm';
import INPCHistory from '@/components/inpc/INPCHistory';
import { verifyProcessNumber } from '@/services/inpcService';

export default function INPCUpdate() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processVerification, setProcessVerification] = useState(null);
  const queryClient = useQueryClient();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['inpc-updates'],
    queryFn: () => base44.entities.INPCUpdate.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.INPCUpdate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inpc-updates'] });
    },
  });

  const handleSubmit = async (data) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessVerification(null);

    try {
      console.log('Iniciando processamento...', { 
        planilhaA: data.planilhaA?.name, 
        planilhaB: data.planilhaB?.name,
        inpcValue: data.inpcValue,
        monthYear: data.monthYear,
        processNumber: data.processNumber
      });

      // Se número de processo foi informado, verificar antes de processar
      if (data.processNumber && data.processNumber.trim()) {
        console.log('Verificando número de processo...');
        const verification = await verifyProcessNumber(
          data.planilhaA,
          data.planilhaB,
          data.processNumber
        );
        
        setProcessVerification(verification);
        
        if (!verification.found) {
          setError(`Número de processo não encontrado: ${verification.message}`);
          setIsProcessing(false);
          return;
        }
        
        console.log('Número de processo encontrado:', verification);
      }

      const { processarPlanilhasComINPC } = await import('@/api/base44Client');
      
      const processResult = await processarPlanilhasComINPC(
        data.planilhaA,
        data.planilhaB,
        data.inpcValue,
        data.monthYear
      );

      console.log('Processamento concluído:', processResult);

      // Salvar no histórico (opcional, não bloquear se falhar)
      try {
        await createMutation.mutateAsync({
          month_year: data.monthYear,
          inpc_value: data.inpcValue,
          planilha_a_url: processResult.planilhaAUrl || '',
          planilha_b_url: processResult.planilhaBUrl || '',
          status: 'completed'
        });
      } catch (saveError) {
        console.warn('Erro ao salvar no histórico:', saveError);
        // Não bloquear o processo se falhar ao salvar
      }

      setResult({
        status: 'success',
        message: 'Planilhas processadas com sucesso!',
        planilha_a_summary: `Planilha A atualizada com índice INPC de ${data.inpcValue}%`,
        planilha_b_summary: `Planilha B atualizada com índice INPC de ${data.inpcValue}%`,
        planilhaAUrl: processResult.planilhaAUrl,
        planilhaBUrl: processResult.planilhaBUrl,
        processVerification: processVerification
      });

    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao processar planilhas. Por favor, verifique os arquivos e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Atualização INPC</h1>
            <p className="text-sm text-slate-600 mt-1">Processamento de Planilhas A e B</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="update" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1.5 rounded-lg h-auto">
          <TabsTrigger
            value="update"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-6 py-2.5 text-sm font-medium"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Nova Atualização
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-6 py-2.5 text-sm font-medium"
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="update" className="space-y-6">
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <CardTitle className="text-xl font-semibold">Processar Atualização</CardTitle>
              <p className="text-blue-50 text-sm mt-2">Informe o índice INPC e faça upload das planilhas para processamento</p>
            </CardHeader>
            <CardContent className="p-8">
              <INPCForm onSubmit={handleSubmit} isProcessing={isProcessing} />

              {processVerification && processVerification.found && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className="mt-6 bg-emerald-50 border-emerald-200">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="font-medium text-emerald-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4" />
                        <span>{processVerification.message}</span>
                      </div>
                      {processVerification.details && (
                        <div className="mt-2 text-sm text-emerald-700 space-y-1">
                          {processVerification.foundInA && processVerification.details.planilhaA && (
                            <p>• Planilha A: Aba "{processVerification.details.planilhaA.sheet}", Linha {processVerification.details.planilhaA.row}, Coluna {processVerification.details.planilhaA.col}</p>
                          )}
                          {processVerification.foundInB && processVerification.details.planilhaB && (
                            <p>• Planilha B: Aba "{processVerification.details.planilhaB.sheet}", Linha {processVerification.details.planilhaB.row}, Coluna {processVerification.details.planilhaB.col}</p>
                          )}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900 text-lg mb-1">Processamento Concluído</h3>
                      <p className="text-emerald-700 text-sm">{result.message}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6 pl-13">
                    {result.planilha_a_summary && (
                      <p className="text-sm text-slate-700">
                        <strong className="text-emerald-800">Planilha A:</strong> {result.planilha_a_summary}
                      </p>
                    )}
                    {result.planilha_b_summary && (
                      <p className="text-sm text-slate-700">
                        <strong className="text-emerald-800">Planilha B:</strong> {result.planilha_b_summary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => window.open(result.planilhaAUrl, '_blank')}
                      className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 shadow-md"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Planilha A
                    </Button>
                    <Button
                      onClick={() => window.open(result.planilhaBUrl, '_blank')}
                      variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 h-11 px-6"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Planilha B
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-700 text-white p-6">
              <CardTitle className="text-xl font-semibold">Histórico de Atualizações</CardTitle>
              <p className="text-slate-300 text-sm mt-2">Todas as atualizações INPC realizadas</p>
            </CardHeader>
            <CardContent className="p-6">
              <INPCHistory updates={updates || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
