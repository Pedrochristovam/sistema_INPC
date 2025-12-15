import { processarINPC, uploadPlanilhas } from './inpcApi';
import { extrairInfo, gerarTexto, salvarCredito } from './creditApi';
import { createDownloadUrl } from './inpcApi';

// Mock base44 client integrado com os serviços locais
export const base44 = {
  entities: {
    INPCUpdate: {
      list: async (orderBy = '-created_date', limit = 50) => {
        // Em produção, buscar do backend
        const stored = localStorage.getItem('inpc_updates');
        if (stored) {
          const updates = JSON.parse(stored);
          return updates.slice(0, limit);
        }
        return [];
      },
      create: async (data) => {
        // Salvar localmente (em produção, salvar no backend)
        const stored = localStorage.getItem('inpc_updates') || '[]';
        const updates = JSON.parse(stored);
        const newUpdate = {
          id: Date.now().toString(),
          ...data,
          created_date: new Date().toISOString()
        };
        updates.unshift(newUpdate);
        localStorage.setItem('inpc_updates', JSON.stringify(updates));
        
        return newUpdate;
      },
    },
    CreditIdentification: {
      list: async (orderBy = '-created_date', limit = 50) => {
        // Em produção, buscar do backend
        const stored = localStorage.getItem('credit_identifications');
        if (stored) {
          const records = JSON.parse(stored);
          return records.slice(0, limit);
        }
        return [];
      },
      create: async (data) => {
        // Salvar localmente (em produção, salvar no backend)
        const stored = localStorage.getItem('credit_identifications') || '[]';
        const records = JSON.parse(stored);
        const newRecord = {
          id: Date.now().toString(),
          ...data,
          created_date: new Date().toISOString()
        };
        records.unshift(newRecord);
        localStorage.setItem('credit_identifications', JSON.stringify(records));
        
        return newRecord;
      },
    },
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // Em produção, fazer upload real para servidor
        console.log('Uploading file:', file.name);
        // Simular URL do arquivo
        return { file_url: `https://example.com/files/${file.name}` };
      },
      InvokeLLM: async ({ prompt, file_urls, response_json_schema }) => {
        // Em produção, chamar LLM real
        console.log('Invoking LLM with prompt:', prompt);
        
        // Se houver arquivos, processar localmente
        if (file_urls && file_urls.length > 0) {
          // Processar planilhas localmente
          return {
            status: 'success',
            message: 'Processamento concluído com sucesso',
            planilha_a_summary: 'Planilha A processada e atualizada com índice INPC',
            planilha_b_summary: 'Planilha B processada e atualizada com índice INPC',
          };
        }
        
        return {
          status: 'success',
          message: 'Processamento concluído com sucesso',
          planilha_a_summary: 'Planilha A processada',
          planilha_b_summary: 'Planilha B processada',
        };
      },
      ExtractDataFromUploadedFile: async ({ file_url, json_schema, file }) => {
        // Se file for fornecido diretamente, usar serviço local
        if (file) {
          try {
            const result = await extrairInfo(file);
            return {
              status: 'success',
              output: result.data
            };
          } catch (error) {
            return {
              status: 'error',
              details: error.message
            };
          }
        }
        
        // Mock implementation para file_url
        console.log('Extracting data from file:', file_url);
        return {
          status: 'success',
          output: {
            process_number: '0000123-45.2023.4.01.0001',
            debtor_name: 'João Silva',
            cl_number: '12.345',
            received_value: 15000.00,
            receipt_date: '2024-01-15',
          },
        };
      },
    },
  },
};

// Funções auxiliares para integração
export const processarPlanilhasComINPC = async (planilhaA, planilhaB, inpcValue, monthYear) => {
  try {
    // Validar upload
    await uploadPlanilhas(planilhaA, planilhaB);
    
    // Processar
    const result = await processarINPC(planilhaA, planilhaB, inpcValue, monthYear);
    
    // Verificar se o resultado contém os blobs
    if (!result || !result.planilhaA || !result.planilhaB) {
      throw new Error('Erro: Planilhas não foram processadas corretamente');
    }
    
    // Criar URLs de download e fazer download automático
    try {
      const urlA = createDownloadUrl(result.planilhaA, `Planilha_A_${monthYear}.xlsx`);
      const urlB = createDownloadUrl(result.planilhaB, `Planilha_B_${monthYear}.xlsx`);
      
      return {
        ...result,
        planilhaAUrl: urlA,
        planilhaBUrl: urlB
      };
    } catch (downloadError) {
      console.error('Erro ao fazer download:', downloadError);
      // Mesmo com erro no download, retornar o resultado
      return {
        ...result,
        planilhaAUrl: null,
        planilhaBUrl: null,
        downloadError: downloadError.message
      };
    }
  } catch (error) {
    console.error('Erro ao processar planilhas:', error);
    throw error;
  }
};

export const processarCreditoCompleto = async (file) => {
  try {
    // Extrair informações
    const extractionResult = await extrairInfo(file);
    
    // Gerar texto
    const text = await gerarTexto(extractionResult.data);
    
    return {
      ...extractionResult,
      text
    };
  } catch (error) {
    throw error;
  }
};
