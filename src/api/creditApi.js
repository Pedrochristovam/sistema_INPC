import { processCreditFile, generateAGEText } from '@/services/creditService';

/**
 * API endpoints para identificação de crédito
 */

/**
 * Extrai informações de um anexo (03 ou 04)
 * @param {File} file - Arquivo do anexo
 * @returns {Promise<Object>} - Dados extraídos
 */
export async function extrairInfo(file) {
  try {
    // Em produção, isso seria uma chamada HTTP real
    // Por enquanto, processamos localmente
    
    const formData = new FormData();
    formData.append('file', file);

    // Simular chamada para API
    // const response = await fetch('/api/extrair-info', {
    //   method: 'POST',
    //   body: formData
    // });
    // return await response.json();

    // Processar localmente
    const result = await processCreditFile(file);
    
    return {
      success: true,
      data: result.data,
      text: result.text
    };
  } catch (error) {
    throw new Error(`Erro ao extrair informações: ${error.message}`);
  }
}

/**
 * Gera texto para AGE baseado nos dados
 * @param {Object} data - Dados do crédito
 * @returns {Promise<String>} - Texto gerado
 */
export async function gerarTexto(data) {
  try {
    // Em produção, fazer chamada HTTP real
    // const response = await fetch('/api/gerar-texto', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // const result = await response.json();
    // return result.text;

    // Gerar localmente
    const text = generateAGEText(data);
    
    return text;
  } catch (error) {
    throw new Error(`Erro ao gerar texto: ${error.message}`);
  }
}

/**
 * Salva dados extraídos no histórico
 * @param {Object} data - Dados do crédito
 * @param {String} generatedText - Texto gerado
 * @returns {Promise<Object>} - Dados salvos
 */
export async function salvarCredito(data, generatedText) {
  try {
    // Em produção, fazer chamada HTTP real
    // const response = await fetch('/api/creditos', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...data,
    //     generated_text: generatedText
    //   })
    // });
    // return await response.json();

    // Mock response
    return {
      success: true,
      id: Date.now().toString(),
      ...data,
      generated_text: generatedText,
      created_date: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Erro ao salvar crédito: ${error.message}`);
  }
}




