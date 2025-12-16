import * as XLSX from 'xlsx';

/**
 * Extrai informações de um arquivo PDF (anexo 03 ou 04)
 * Nota: Para processamento real de PDF, seria necessário um serviço backend
 * Esta é uma implementação mock que pode ser integrada com uma API
 * @param {File} file - Arquivo PDF
 * @returns {Promise<Object>} - Dados extraídos
 */
export async function extractFromPDF(file) {
  // Em produção, isso seria feito no backend com pdf-parse ou similar
  // Por enquanto, retornamos uma estrutura mock
  return new Promise((resolve) => {
    // Simular processamento assíncrono
    setTimeout(() => {
      resolve({
        process_number: '0000123-45.2023.4.01.0001',
        debtor_name: 'Nome do Devedor',
        cl_number: '12.345',
        received_value: 15000.00,
        receipt_date: new Date().toISOString().split('T')[0],
        source_file: file.name
      });
    }, 1000);
  });
}

/**
 * Extrai informações de um arquivo Excel (anexo 03 ou 04)
 * @param {File} file - Arquivo Excel
 * @returns {Promise<Object>} - Dados extraídos
 */
export async function extractFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Tentar encontrar dados em todas as abas
        let extractedData = {
          process_number: null,
          debtor_name: null,
          cl_number: null,
          received_value: null,
          receipt_date: null
        };

        // Processar cada aba
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          // Procurar por padrões comuns
          jsonData.forEach((row, rowIndex) => {
            const rowText = row.join(' ').toLowerCase();
            
            // Procurar número do processo
            if (!extractedData.process_number) {
              const processMatch = rowText.match(/(\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4})/);
              if (processMatch) {
                extractedData.process_number = processMatch[1];
              }
            }
            
            // Procurar nome do devedor (geralmente após "devedor", "requerido", etc)
            if (!extractedData.debtor_name) {
              const debtorKeywords = ['devedor', 'requerido', 'réu', 'nome'];
              const hasKeyword = debtorKeywords.some(kw => rowText.includes(kw));
              if (hasKeyword && row.length > 1) {
                extractedData.debtor_name = row.find(cell => 
                  cell && typeof cell === 'string' && cell.length > 5
                ) || null;
              }
            }
            
            // Procurar número do CL
            if (!extractedData.cl_number) {
              const clMatch = rowText.match(/(\d{2}\.\d{3})/);
              if (clMatch) {
                extractedData.cl_number = clMatch[1];
              }
            }
            
            // Procurar valor recebido
            if (!extractedData.received_value) {
              const valueMatch = rowText.match(/r\$\s*([\d.,]+)/i) || rowText.match(/([\d.,]+)\s*reais/i);
              if (valueMatch) {
                const valueStr = valueMatch[1].replace(/\./g, '').replace(',', '.');
                extractedData.received_value = parseFloat(valueStr);
              }
            }
            
            // Procurar data
            if (!extractedData.receipt_date) {
              const dateMatch = rowText.match(/(\d{2}\/\d{2}\/\d{4})/);
              if (dateMatch) {
                const [day, month, year] = dateMatch[1].split('/');
                extractedData.receipt_date = `${year}-${month}-${day}`;
              }
            }
          });
        });

        // Validar dados extraídos
        if (!extractedData.process_number || !extractedData.debtor_name || !extractedData.received_value) {
          reject(new Error('Não foi possível extrair todos os dados necessários do arquivo'));
          return;
        }

        resolve({
          ...extractedData,
          source_file: file.name
        });
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo Excel: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extrai informações de um anexo (PDF ou Excel)
 * @param {File} file - Arquivo do anexo
 * @returns {Promise<Object>} - Dados extraídos
 */
export async function extractCreditInfo(file) {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (fileExtension === 'pdf') {
    return await extractFromPDF(file);
  } else if (['xlsx', 'xls'].includes(fileExtension)) {
    return await extractFromExcel(file);
  } else {
    throw new Error('Formato de arquivo não suportado. Use PDF ou Excel.');
  }
}

/**
 * Valida os dados extraídos
 * @param {Object} data - Dados extraídos
 * @returns {Object} - { isValid, errors }
 */
export function validateExtractedData(data) {
  const errors = [];
  
  if (!data.process_number) {
    errors.push('Número do processo é obrigatório');
  }
  
  if (!data.debtor_name || data.debtor_name.length < 3) {
    errors.push('Nome do devedor é obrigatório');
  }
  
  if (!data.received_value || data.received_value <= 0) {
    errors.push('Valor recebido deve ser maior que zero');
  }
  
  if (!data.receipt_date) {
    errors.push('Data de recebimento é obrigatória');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Normaliza os dados extraídos
 * @param {Object} data - Dados brutos
 * @returns {Object} - Dados normalizados
 */
export function normalizeCreditData(data) {
  return {
    process_number: (data.process_number || '').trim(),
    debtor_name: (data.debtor_name || '').trim(),
    cl_number: (data.cl_number || '').trim() || null,
    received_value: parseFloat(data.received_value) || 0,
    receipt_date: data.receipt_date || null,
    source_file_name: data.source_file || null
  };
}

/**
 * Gera o texto automático para AGE
 * @param {Object} data - Dados do crédito
 * @returns {String} - Texto formatado
 */
export function generateAGEText(data) {
  const {
    process_number,
    debtor_name,
    cl_number = 'XX.XXX',
    received_value,
    receipt_date
  } = data;

  // Formatar valor
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(received_value);

  // Formatar data
  let formattedDate = '__/__/____';
  if (receipt_date) {
    try {
      const date = new Date(receipt_date);
      formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      // Manter formato padrão se houver erro
    }
  }

  // Gerar texto
  const text = `Assunto: Identificação de crédito – Processo: ${process_number}

Prezado Procurador,

CL ${cl_number} – ${debtor_name}

Considerando o recebimento pela MGI do valor de ${formattedValue} em ${formattedDate} do processo/parte em referência, solicito os préstimos de V.Sa. para informar:

- Origem do recurso;
- Destino do recurso;
- Recuperação parcial ou total do CL.`;

  return text;
}

/**
 * Processa arquivo e gera texto automaticamente
 * @param {File} file - Arquivo do anexo
 * @returns {Promise<Object>} - { data, text }
 */
export async function processCreditFile(file) {
  try {
    // Extrair dados
    const extractedData = await extractCreditInfo(file);
    
    // Normalizar
    const normalizedData = normalizeCreditData(extractedData);
    
    // Validar
    const validation = validateExtractedData(normalizedData);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    // Gerar texto
    const generatedText = generateAGEText(normalizedData);
    
    return {
      data: normalizedData,
      text: generatedText,
      success: true
    };
  } catch (error) {
    throw new Error(`Erro ao processar arquivo: ${error.message}`);
  }
}

/**
 * Converte texto para PDF (implementação mock)
 * Em produção, isso seria feito no backend
 * @param {String} text - Texto a ser convertido
 * @param {String} filename - Nome do arquivo
 * @returns {Blob} - Blob do PDF
 */
export function convertTextToPDF(text, filename = 'identificacao_credito.pdf') {
  // Em produção, usar biblioteca como jsPDF ou fazer no backend
  // Por enquanto, retornamos um blob de texto que pode ser impresso
  const blob = new Blob([text], { type: 'text/plain' });
  return blob;
}




