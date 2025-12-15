import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, History, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CreditForm from '@/components/credit/CreditForm';
import CreditResult from '@/components/credit/CreditResult';
import CreditHistory from '@/components/credit/CreditHistory';

export default function CreditIdentification() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ['credit-records'],
    queryFn: () => base44.entities.CreditIdentification.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CreditIdentification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-records'] });
    },
  });

  const handleSubmit = async (file) => {
    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const { processarCreditoCompleto } = await import('@/api/base44Client');
      
      const result = await processarCreditoCompleto(file);

      setExtractedData({
        ...result.data,
        generated_text: result.text,
        source_file_name: file.name
      });

    } catch (err) {
      setError(err.message || 'Erro ao processar o arquivo. Verifique se o formato está correto e tente novamente.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      setExtractedData(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (updatedData) => {
    setExtractedData(updatedData);
  };

  const handleSelectFromHistory = (record) => {
    setExtractedData(record);
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
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Identificação de Crédito</h1>
            <p className="text-sm text-slate-600 mt-1">Extração de dados dos Anexos 03 e 04</p>
          </div>
        </div>
      </motion.div>

      {extractedData ? (
        <Card className="border border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Resultado da Extração</CardTitle>
                <p className="text-indigo-50 text-sm mt-2">Revise os dados extraídos e gere o texto para AGE</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setExtractedData(null)}
                className="text-white hover:bg-indigo-400/30 h-10 px-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <CreditResult 
              data={extractedData} 
              onSave={handleSave}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="extract" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1.5 rounded-lg h-auto">
            <TabsTrigger
              value="extract"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md px-6 py-2.5 text-sm font-medium"
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Extrair Dados
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md px-6 py-2.5 text-sm font-medium"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-6">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6">
                <CardTitle className="text-xl font-semibold">Upload de Anexo</CardTitle>
                <p className="text-indigo-50 text-sm mt-2">Faça upload do Anexo 03 ou 04 para extrair os dados automaticamente</p>
              </CardHeader>
              <CardContent className="p-8">
                <CreditForm onSubmit={handleSubmit} isProcessing={isProcessing} />

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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-700 text-white p-6">
                <CardTitle className="text-xl font-semibold">Histórico de Consultas</CardTitle>
                <p className="text-slate-300 text-sm mt-2">Consultas de identificação de crédito realizadas</p>
              </CardHeader>
              <CardContent className="p-6">
                <CreditHistory 
                  records={records || []} 
                  isLoading={isLoading}
                  onSelect={handleSelectFromHistory}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
