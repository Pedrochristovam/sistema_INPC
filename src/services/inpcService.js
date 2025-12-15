import * as XLSX from 'xlsx';

/**
 * Valida a estrutura da planilha A
 * @param {Object} workbook - Workbook do XLSX
 * @returns {Object} - { isValid, errors }
 */
export function validatePlanilhaA(workbook) {
  const errors = [];
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    errors.push('Planilha não contém abas');
    return { isValid: false, errors };
  }

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

  if (data.length === 0) {
    errors.push('Planilha está vazia');
    return { isValid: false, errors };
  }

  // Verificar se existe coluna EJ (coluna 135 em base 0)
  const headers = data[0] || [];
  const hasColumnEJ = headers.length > 134 || headers.some((h, i) => {
    const colLetter = XLSX.utils.encode_col(i);
    return colLetter === 'EJ';
  });

  if (!hasColumnEJ) {
    errors.push('Coluna EJ não encontrada na planilha A');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida a estrutura da planilha B
 * @param {Object} workbook - Workbook do XLSX
 * @returns {Object} - { isValid, errors }
 */
export function validatePlanilhaB(workbook) {
  const errors = [];
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    errors.push('Planilha não contém abas');
    return { isValid: false, errors };
  }

  // Verificar se existe aba "Índice Mensal INPC"
  const hasIndexSheet = workbook.SheetNames.some(name => 
    name.toLowerCase().includes('índice') || 
    name.toLowerCase().includes('indice') ||
    name.toLowerCase().includes('inpc')
  );

  if (!hasIndexSheet) {
    errors.push('Aba "Índice Mensal INPC" não encontrada na planilha B');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Lê e valida planilha A preservando formatação
 * @param {File} file - Arquivo da planilha
 * @returns {Promise<Object>} - { workbook, validation }
 */
export async function readPlanilhaA(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        // Ler planilha de forma simples e rápida
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellNF: true,     // Preservar formatação numérica
          cellDates: true   // Preservar datas
        });
        
        const validation = validatePlanilhaA(workbook);
        
        if (!validation.isValid) {
          reject(new Error(`Erro na validação: ${validation.errors.join(', ')}`));
          return;
        }

        resolve({ workbook, validation });
      } catch (error) {
        reject(new Error(`Erro ao ler planilha: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Lê e valida planilha B preservando formatação
 * @param {File} file - Arquivo da planilha
 * @returns {Promise<Object>} - { workbook, validation }
 */
export async function readPlanilhaB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        // Ler planilha de forma simples e rápida
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellNF: true,     // Preservar formatação numérica
          cellDates: true   // Preservar datas
        });
        
        const validation = validatePlanilhaB(workbook);
        
        if (!validation.isValid) {
          reject(new Error(`Erro na validação: ${validation.errors.join(', ')}`));
          return;
        }

        resolve({ workbook, validation });
      } catch (error) {
        reject(new Error(`Erro ao ler planilha: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Encontra a coluna EJ na planilha
 * @param {Array} headers - Array de headers
 * @returns {Number} - Índice da coluna EJ
 */
function findColumnEJ(headers) {
  // EJ é a coluna 135 (base 0: 134)
  // Mas vamos procurar dinamicamente
  for (let i = 0; i < headers.length; i++) {
    const colLetter = XLSX.utils.encode_col(i);
    if (colLetter === 'EJ') {
      return i;
    }
  }
  // Se não encontrar, retorna o índice esperado
  return 134;
}

/**
 * Encontra as colunas DK, DL, DM
 * @param {Array} headers - Array de headers
 * @returns {Object} - { dk, dl, dm }
 */
function findColumnsDK_DL_DM(headers) {
  const columns = { dk: null, dl: null, dm: null };
  
  for (let i = 0; i < headers.length; i++) {
    const colLetter = XLSX.utils.encode_col(i);
    if (colLetter === 'DK') columns.dk = i;
    if (colLetter === 'DL') columns.dl = i;
    if (colLetter === 'DM') columns.dm = i;
  }

  // Se não encontrar, usar índices esperados
  if (columns.dk === null) columns.dk = 109; // DK
  if (columns.dl === null) columns.dl = 110; // DL
  if (columns.dm === null) columns.dm = 111; // DM

  return columns;
}

/**
 * Copia estilos de uma célula para outra
 * @param {Object} sourceCell - Célula origem
 * @param {Object} targetCell - Célula destino
 */
function copyCellStyles(sourceCell, targetCell) {
  if (!sourceCell || !targetCell) return;
  
  // Copiar propriedades de estilo
  if (sourceCell.s) {
    targetCell.s = JSON.parse(JSON.stringify(sourceCell.s));
  }
  
  // Copiar formatação (z)
  if (sourceCell.z) {
    targetCell.z = sourceCell.z;
  }
  
  // Copiar tipo
  if (sourceCell.t) {
    targetCell.t = sourceCell.t;
  }
}

/**
 * Encontra as 3 colunas de "VALOR ESTIMADO" do último mês gerado
 * @param {Object} worksheet - Worksheet
 * @param {Number} startCol - Coluna inicial para busca
 * @param {Number} endCol - Coluna final para busca
 * @returns {Object|null} - { col1, col2, col3 } ou null se não encontrar
 */
function findLastValorEstimadoColumns(worksheet, startCol, endCol) {
  try {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    let lastFoundCols = null;
    let lastDateValue = null; // Armazenar valor numérico da data (ano * 12 + mês) para comparação
    
    // Padrões para os 3 títulos (capturando mês E ano)
    const pattern1 = /VALOR ESTIMADO PARA \d+\s+DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s+DE\s+(\d{4})\s+CONFORME PARAMETROS DA LEI 18\.002\/2009/i;
    const pattern2 = /VALOR ESTIMADO PARA \d+\s+DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s+DE\s+(\d{4})\s+PARA PAGAMENTO À VISTA CONFORME PARAMETROS DA LEI 18\.002\/2009/i;
    const pattern3 = /VALOR ESTIMADO PARA \d+\s+DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s+DE\s+(\d{4})\s+COM O MENOR DESCONTO CONFORME PARAMETROS DA LEI 18\.002\/2009/i;
    
    if (startCol < 0 || endCol < 0 || startCol > endCol) {
      return null;
    }
    
    // Procurar pelas 3 colunas em sequência
    for (let col = startCol; col <= endCol - 2; col++) {
      try {
        const headerRef1 = XLSX.utils.encode_cell({ r: 0, c: col });
        const headerRef2 = XLSX.utils.encode_cell({ r: 0, c: col + 1 });
        const headerRef3 = XLSX.utils.encode_cell({ r: 0, c: col + 2 });
        
        const headerCell1 = worksheet[headerRef1];
        const headerCell2 = worksheet[headerRef2];
        const headerCell3 = worksheet[headerRef3];
        
        if (headerCell1 && headerCell1.v && headerCell2 && headerCell2.v && headerCell3 && headerCell3.v) {
          const headerValue1 = String(headerCell1.v).trim();
          const headerValue2 = String(headerCell2.v).trim();
          const headerValue3 = String(headerCell3.v).trim();
          
          const match1 = headerValue1.match(pattern1);
          const match2 = headerValue2.match(pattern2);
          const match3 = headerValue3.match(pattern3);
          
          if (match1 && match2 && match3) {
            // Extrair mês e ano das 3 colunas (devem ser iguais)
            const monthName = match1[1].toLowerCase();
            const year = parseInt(match1[2], 10);
            const monthIndex = meses.findIndex(m => m === monthName);
            
            // Verificar se o ano e mês são consistentes nas 3 colunas
            const year2 = parseInt(match2[2], 10);
            const year3 = parseInt(match3[2], 10);
            const monthName2 = match2[1].toLowerCase();
            const monthName3 = match3[1].toLowerCase();
            
            if (monthIndex !== -1 && year === year2 && year === year3 && 
                monthName === monthName2 && monthName === monthName3) {
              // Calcular valor numérico da data para comparação (ano * 12 + mês)
              // Isso permite comparar corretamente mesmo quando muda de ano
              const dateValue = year * 12 + monthIndex;
              
              // Se é mais recente que o último encontrado, atualizar
              if (lastDateValue === null || dateValue > lastDateValue) {
                lastDateValue = dateValue;
                lastFoundCols = {
                  col1: col,
                  col2: col + 1,
                  col3: col + 2,
                  monthName: monthName,
                  monthIndex: monthIndex,
                  year: year
                };
              }
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return lastFoundCols;
  } catch (error) {
    console.warn('Erro ao encontrar colunas VALOR ESTIMADO:', error);
    return null;
  }
}

/**
 * Encontra a última coluna mensal gerada (formato "mês/ano")
 * @param {Object} worksheet - Worksheet
 * @param {Number} startCol - Coluna inicial para busca (geralmente EJ)
 * @param {Number} endCol - Coluna final para busca
 * @returns {Number|null} - Índice da última coluna mensal ou null
 */
function findLastMonthlyColumn(worksheet, startCol, endCol) {
  try {
    let lastMonthlyCol = null;
    const monthYearPattern = /^(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\/\d{4}$/i;
    
    // Garantir que startCol e endCol sejam válidos
    if (startCol < 0 || endCol < 0 || startCol > endCol) {
      return null;
    }
    
    for (let col = startCol; col <= endCol; col++) {
      try {
        const headerRef = XLSX.utils.encode_cell({ r: 0, c: col });
        const headerCell = worksheet[headerRef];
        
        if (headerCell && headerCell.v) {
          const headerValue = String(headerCell.v).trim();
          if (monthYearPattern.test(headerValue)) {
            lastMonthlyCol = col;
          }
        }
      } catch (e) {
        // Continuar procurando mesmo se houver erro em uma célula
        continue;
      }
    }
    
    return lastMonthlyCol;
  } catch (error) {
    console.warn('Erro ao encontrar última coluna mensal:', error);
    return null;
  }
}

/**
 * Aplica o índice INPC na Planilha A preservando formatação
 * @param {Object} workbook - Workbook da planilha A
 * @param {Number} inpcValue - Valor do índice INPC (ex: 0.52 para 0,52%)
 * @param {String} monthYear - Mês/Ano no formato YYYY-MM
 * @returns {Object} - Workbook atualizado
 */
export function applyINPCPlanilhaA(workbook, inpcValue, monthYear) {
  try {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error('Worksheet não encontrado');
    }
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Encontrar colunas fixas
    const ejCol = findColumnEJ([]);
    const { dk, dl, dm } = findColumnsDK_DL_DM([]);
    
    // Encontrar a última coluna mensal gerada (formato "mês/ano")
    const lastMonthlyCol = findLastMonthlyColumn(worksheet, ejCol + 1, range.e.c);
    
    // Determinar coluna de referência: última mensal gerada ou EJ se não houver nenhuma
    const referenceCol = lastMonthlyCol !== null ? lastMonthlyCol : ejCol;
  
  // Criar nova coluna mensal
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
  const newColumnName = `${monthName}/${year}`;
  
  const newMonthlyCol = range.e.c + 1;
  
  // Adicionar header da nova coluna mensal
  const headerRef = XLSX.utils.encode_cell({ r: 0, c: newMonthlyCol });
  worksheet[headerRef] = {
    v: newColumnName,
    t: 's'
  };
  
  // Preencher nova coluna mensal com valores
  for (let row = 1; row <= range.e.r; row++) {
    const newCellRef = XLSX.utils.encode_cell({ r: row, c: newMonthlyCol });
    const refCell = worksheet[XLSX.utils.encode_cell({ r: row, c: referenceCol })];
    
    worksheet[newCellRef] = {
      v: inpcValue,
      t: 'n',
      z: refCell?.z || '#,##0.00'
    };
  }
  
  // Encontrar as 3 colunas de "VALOR ESTIMADO" do último mês gerado
  const lastValorEstimadoCols = findLastValorEstimadoColumns(worksheet, 0, range.e.c);
  
  // Validar e garantir que o valor do INPC está correto
  const inpcValueParsed = parseFloat(inpcValue);
  if (isNaN(inpcValueParsed) || inpcValueParsed < 0) {
    console.warn(`Valor do INPC inválido: ${inpcValue}. Usando 0 como padrão.`);
  }
  const validInpcValue = isNaN(inpcValueParsed) ? 0 : inpcValueParsed;
  
  // Se encontrou as 3 colunas de VALOR ESTIMADO, criar 3 novas colunas logo após elas
  if (lastValorEstimadoCols) {
    console.log(`Encontradas colunas VALOR ESTIMADO do último mês: ${lastValorEstimadoCols.monthName}/${lastValorEstimadoCols.year} (colunas ${lastValorEstimadoCols.col1}, ${lastValorEstimadoCols.col2}, ${lastValorEstimadoCols.col3})`);
    console.log(`Criando novas colunas para: ${monthName}/${year} com INPC de ${validInpcValue}%`);
    
    // Inserir as 3 novas colunas logo após a última coluna de VALOR ESTIMADO
    const newValorCol1 = lastValorEstimadoCols.col3 + 1;
    const newValorCol2 = lastValorEstimadoCols.col3 + 2;
    const newValorCol3 = lastValorEstimadoCols.col3 + 3;
    
    // Obter os títulos originais e substituir o mês
    const headerRef1 = XLSX.utils.encode_cell({ r: 0, c: lastValorEstimadoCols.col1 });
    const headerRef2 = XLSX.utils.encode_cell({ r: 0, c: lastValorEstimadoCols.col2 });
    const headerRef3 = XLSX.utils.encode_cell({ r: 0, c: lastValorEstimadoCols.col3 });
    
    const originalHeader1 = String(worksheet[headerRef1]?.v || '');
    const originalHeader2 = String(worksheet[headerRef2]?.v || '');
    const originalHeader3 = String(worksheet[headerRef3]?.v || '');
    
    // Substituir o mês antigo pelo novo mês (capitalizado)
    const newMonthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const mesesAntigosCapitalized = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let newHeader1 = originalHeader1;
    let newHeader2 = originalHeader2;
    let newHeader3 = originalHeader3;
    
    // Substituir todos os meses antigos pelo novo mês
    mesesAntigosCapitalized.forEach((mesAntigo) => {
      const regex = new RegExp(mesAntigo, 'gi');
      newHeader1 = newHeader1.replace(regex, newMonthNameCapitalized);
      newHeader2 = newHeader2.replace(regex, newMonthNameCapitalized);
      newHeader3 = newHeader3.replace(regex, newMonthNameCapitalized);
    });
    
    // Adicionar headers das novas colunas VALOR ESTIMADO
    worksheet[XLSX.utils.encode_cell({ r: 0, c: newValorCol1 })] = {
      v: newHeader1,
      t: 's'
    };
    worksheet[XLSX.utils.encode_cell({ r: 0, c: newValorCol2 })] = {
      v: newHeader2,
      t: 's'
    };
    worksheet[XLSX.utils.encode_cell({ r: 0, c: newValorCol3 })] = {
      v: newHeader3,
      t: 's'
    };
    
    // Calcular multiplicador do INPC: novoValor = valorAnterior * (1 + inpcValue/100)
    // Exemplo: se INPC = 0.5%, multiplicador = 1.005
    const multiplier = 1 + (validInpcValue / 100);
    console.log(`Multiplicador INPC aplicado: ${multiplier} (${validInpcValue}%)`);
    
    // Preencher as 3 novas colunas baseadas nas 3 colunas de referência do ÚLTIMO mês gerado
    for (let row = 1; row <= range.e.r; row++) {
      try {
        const refCell1Ref = XLSX.utils.encode_cell({ r: row, c: lastValorEstimadoCols.col1 });
        const refCell2Ref = XLSX.utils.encode_cell({ r: row, c: lastValorEstimadoCols.col2 });
        const refCell3Ref = XLSX.utils.encode_cell({ r: row, c: lastValorEstimadoCols.col3 });
        
        const refCell1 = worksheet[refCell1Ref];
        const refCell2 = worksheet[refCell2Ref];
        const refCell3 = worksheet[refCell3Ref];
        
        // Obter valores do ÚLTIMO mês gerado (ex: outubro se estamos gerando novembro)
        const value1 = parseFloat(refCell1?.v) || 0;
        const value2 = parseFloat(refCell2?.v) || 0;
        const value3 = parseFloat(refCell3?.v) || 0;
        
        // Aplicar cálculo do INPC: novoValor = valorAnterior * (1 + inpcValue/100)
        const newValue1 = value1 * multiplier;
        const newValue2 = value2 * multiplier;
        const newValue3 = value3 * multiplier;
        
        worksheet[XLSX.utils.encode_cell({ r: row, c: newValorCol1 })] = {
          v: newValue1,
          t: 'n',
          z: refCell1?.z || '#,##0.00'
        };
        
        worksheet[XLSX.utils.encode_cell({ r: row, c: newValorCol2 })] = {
          v: newValue2,
          t: 'n',
          z: refCell2?.z || '#,##0.00'
        };
        
        worksheet[XLSX.utils.encode_cell({ r: row, c: newValorCol3 })] = {
          v: newValue3,
          t: 'n',
          z: refCell3?.z || '#,##0.00'
        };
      } catch (rowError) {
        console.warn(`Erro ao processar linha ${row} das colunas VALOR ESTIMADO:`, rowError);
        continue;
      }
    }
    
    // Atualizar range temporariamente para incluir as novas colunas VALOR ESTIMADO
    range.e.c = Math.max(range.e.c, newValorCol3);
  } else {
    console.log('Nenhuma coluna VALOR ESTIMADO anterior encontrada. Pulando criação de novas colunas VALOR ESTIMADO.');
  }
  
  // Criar 3 novas colunas para DK, DL, DM do novo mês (sempre no final)
  const currentLastCol = range.e.c;
  const newDkCol = currentLastCol + 1;
  const newDlCol = currentLastCol + 2;
  const newDmCol = currentLastCol + 3;
  
  // Adicionar headers das colunas DK, DL, DM
  worksheet[XLSX.utils.encode_cell({ r: 0, c: newDkCol })] = {
    v: `DK ${newColumnName}`,
    t: 's'
  };
  worksheet[XLSX.utils.encode_cell({ r: 0, c: newDlCol })] = {
    v: `DL ${newColumnName}`,
    t: 's'
  };
  worksheet[XLSX.utils.encode_cell({ r: 0, c: newDmCol })] = {
    v: `DM ${newColumnName}`,
    t: 's'
  };
  
  // Preencher DK, DL, DM baseados na última coluna mensal gerada
  for (let row = 1; row <= range.e.r; row++) {
    try {
      const refCellRef = XLSX.utils.encode_cell({ r: row, c: referenceCol });
      const refCell = worksheet[refCellRef];
      const refValue = parseFloat(refCell?.v) || 0;
      
      // Calcular DK, DL, DM baseado no valor da última coluna mensal
      const dkValue = refValue * 1.0;
      const dlValue = refValue * 1.0;
      const dmValue = refValue * 1.0;
      
      worksheet[XLSX.utils.encode_cell({ r: row, c: newDkCol })] = {
        v: dkValue,
        t: 'n',
        z: refCell?.z || '#,##0.00'
      };
      
      worksheet[XLSX.utils.encode_cell({ r: row, c: newDlCol })] = {
        v: dlValue,
        t: 'n',
        z: refCell?.z || '#,##0.00'
      };
      
      worksheet[XLSX.utils.encode_cell({ r: row, c: newDmCol })] = {
        v: dmValue,
        t: 'n',
        z: refCell?.z || '#,##0.00'
      };
    } catch (rowError) {
      console.warn(`Erro ao processar linha ${row}:`, rowError);
      continue;
    }
  }
  
  // Atualizar range final incluindo todas as novas colunas
  range.e.c = newDmCol;
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
  // Preservar larguras de colunas
  if (worksheet['!cols']) {
    const refColWidth = worksheet['!cols'][referenceCol]?.w || 12;
    const colsToSet = [newMonthlyCol, newDkCol, newDlCol, newDmCol];
    
    // Se criou as colunas VALOR ESTIMADO, adicionar também
    if (lastValorEstimadoCols) {
      colsToSet.push(lastValorEstimadoCols.col3 + 1, lastValorEstimadoCols.col3 + 2, lastValorEstimadoCols.col3 + 3);
    }
    
    colsToSet.forEach(col => {
      if (!worksheet['!cols'][col]) {
        worksheet['!cols'][col] = { w: refColWidth };
      }
    });
  } else {
    worksheet['!cols'] = [];
    const refColWidth = 12;
    const colsToSet = [newMonthlyCol, newDkCol, newDlCol, newDmCol];
    
    // Se criou as colunas VALOR ESTIMADO, adicionar também
    if (lastValorEstimadoCols) {
      colsToSet.push(lastValorEstimadoCols.col3 + 1, lastValorEstimadoCols.col3 + 2, lastValorEstimadoCols.col3 + 3);
    }
    
    colsToSet.forEach(col => {
      worksheet['!cols'][col] = { w: refColWidth };
    });
  }

    return workbook;
  } catch (error) {
    console.error('Erro ao aplicar INPC na Planilha A:', error);
    throw new Error(`Erro ao processar Planilha A: ${error.message}`);
  }
}

/**
 * Encontra a aba "Índice Mensal INPC" na planilha B
 * @param {Object} workbook - Workbook da planilha B
 * @returns {String} - Nome da aba encontrada
 */
function findIndexSheet(workbook) {
  return workbook.SheetNames.find(name => 
    name.toLowerCase().includes('índice') || 
    name.toLowerCase().includes('indice') ||
    name.toLowerCase().includes('inpc')
  ) || workbook.SheetNames[0];
}

/**
 * Encontra as colunas DE, DF, DG
 * @param {Array} headers - Array de headers
 * @returns {Object} - { de, df, dg }
 */
function findColumnsDE_DF_DG(headers) {
  const columns = { de: null, df: null, dg: null };
  
  for (let i = 0; i < headers.length; i++) {
    const colLetter = XLSX.utils.encode_col(i);
    if (colLetter === 'DE') columns.de = i;
    if (colLetter === 'DF') columns.df = i;
    if (colLetter === 'DG') columns.dg = i;
  }

  // Se não encontrar, usar índices esperados
  if (columns.de === null) columns.de = 107; // DE
  if (columns.df === null) columns.df = 108; // DF
  if (columns.dg === null) columns.dg = 109; // DG

  return columns;
}

/**
 * Aplica o índice INPC na Planilha B preservando formatação
 * @param {Object} workbook - Workbook da planilha B
 * @param {Number} inpcValue - Valor do índice INPC
 * @param {String} monthYear - Mês/Ano no formato YYYY-MM
 * @returns {Object} - Workbook atualizado
 */
export function applyINPCPlanilhaB(workbook, inpcValue, monthYear) {
  const indexSheetName = findIndexSheet(workbook);
  const worksheet = workbook.Sheets[indexSheetName];
  
  if (!worksheet['!ref']) {
    throw new Error('Aba de índice está vazia');
  }
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const { de, df, dg } = findColumnsDE_DF_DG([]);
  
  // Encontrar coluna de índice INPC (geralmente primeira coluna ou coluna com "INPC" no header)
  let inpcCol = 0;
  for (let c = 0; c <= range.e.c; c++) {
    const headerRef = XLSX.utils.encode_cell({ r: 0, c });
    const headerCell = worksheet[headerRef];
    if (headerCell && headerCell.v) {
      const headerValue = headerCell.v.toString().toLowerCase();
      if (headerValue.includes('inpc') || headerValue.includes('índice')) {
        inpcCol = c;
        break;
      }
    }
  }
  
  // Atualizar valores
  for (let row = 1; row <= range.e.r; row++) {
    const inpcCellRef = XLSX.utils.encode_cell({ r: row, c: inpcCol });
    const inpcCell = worksheet[inpcCellRef];
    
    if (inpcCell) {
      inpcCell.v = inpcValue;
      inpcCell.t = 'n';
    }
    
    // Recalcular DE, DF, DG
    const baseValue = parseFloat(inpcValue) || 0;
    
    const deCellRef = XLSX.utils.encode_cell({ r: row, c: de });
    const dfCellRef = XLSX.utils.encode_cell({ r: row, c: df });
    const dgCellRef = XLSX.utils.encode_cell({ r: row, c: dg });
    
    if (worksheet[deCellRef]) {
      worksheet[deCellRef].v = baseValue * 1.0;
      worksheet[deCellRef].t = 'n';
    }
    
    if (worksheet[dfCellRef]) {
      worksheet[dfCellRef].v = baseValue * 1.0;
      worksheet[dfCellRef].t = 'n';
    }
    
    if (worksheet[dgCellRef]) {
      worksheet[dgCellRef].v = baseValue * 1.0;
      worksheet[dgCellRef].t = 'n';
    }
  }
  
  // Criar nova coluna mensal preservando formatação
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
  const newColumnName = `${monthName}/${year}`;
  
  const lastCol = range.e.c + 1;
  
  // Adicionar header
  const headerRef = XLSX.utils.encode_cell({ r: 0, c: lastCol });
  worksheet[headerRef] = {
    v: newColumnName,
    t: 's'
  };
  
  // Preencher nova coluna
  for (let row = 1; row <= range.e.r; row++) {
    const newCellRef = XLSX.utils.encode_cell({ r: row, c: lastCol });
    const refCellForStyle = XLSX.utils.encode_cell({ r: row, c: inpcCol });
    const refCell = worksheet[refCellForStyle];
    
    worksheet[newCellRef] = {
      v: inpcValue,
      t: 'n',
      z: refCell?.z || '#,##0.00'
    };
  }
  
  // Atualizar range
  range.e.c = lastCol;
  worksheet['!ref'] = XLSX.utils.encode_range(range);
  
  // Preservar larguras de colunas
  if (worksheet['!cols']) {
    const refColWidth = worksheet['!cols'][inpcCol]?.w || 12;
    if (!worksheet['!cols'][lastCol]) {
      worksheet['!cols'][lastCol] = { w: refColWidth };
    }
  } else {
    worksheet['!cols'] = [];
    worksheet['!cols'][lastCol] = { w: 12 };
  }
  
  // Preservar alturas de linhas se existirem
  if (worksheet['!rows']) {
    // Manter alturas existentes
  }

  return workbook;
}

/**
 * Exporta workbook para arquivo Excel preservando toda formatação
 * @param {Object} workbook - Workbook processado
 * @param {String} filename - Nome do arquivo
 * @returns {Blob} - Blob do arquivo Excel
 */
export function exportWorkbook(workbook, filename = 'planilha_processada.xlsx') {
  // Exportar de forma simples e rápida
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    cellNF: true,        // Preservar formatação numérica
    cellDates: true      // Preservar datas
  });
  
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  return blob;
}


/**
 * Normaliza número de processo removendo formatação e caracteres especiais
 * Suporta diferentes formatos: CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO), apenas números, etc.
 * @param {String} processNumber - Número do processo
 * @returns {String} - Número normalizado (apenas dígitos)
 */
export function normalizeProcessNumber(processNumber) {
  if (!processNumber || typeof processNumber !== 'string') {
    return '';
  }
  
  // Remove todos os caracteres não numéricos
  return processNumber.replace(/\D/g, '');
}

/**
 * Busca número de processo em uma planilha
 * @param {Object} workbook - Workbook do XLSX
 * @param {String} processNumber - Número do processo a buscar
 * @returns {Object} - { found: boolean, sheet: string, row: number, col: number }
 */
export function searchProcessNumberInWorkbook(workbook, processNumber) {
  if (!processNumber || !processNumber.trim()) {
    return { found: false, message: 'Número de processo não informado' };
  }

  const normalizedSearch = normalizeProcessNumber(processNumber);
  
  if (!normalizedSearch || normalizedSearch.length < 10) {
    return { found: false, message: 'Número de processo inválido (mínimo 10 dígitos)' };
  }

  // Buscar em todas as abas da planilha
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Buscar em todas as células
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v !== null && cell.v !== undefined) {
          const cellValue = String(cell.v);
          const normalizedCellValue = normalizeProcessNumber(cellValue);
          
          // Verificar correspondência
          // Se ambos têm 15+ dígitos, fazer correspondência exata
          // Caso contrário, fazer busca parcial (útil para números menores ou parciais)
          let matches = false;
          if (normalizedSearch.length >= 15 && normalizedCellValue.length >= 15) {
            // Correspondência exata para números longos (formato CNJ completo)
            matches = normalizedCellValue === normalizedSearch;
          } else {
            // Busca parcial para números menores ou quando busca por parte do número
            matches = normalizedCellValue === normalizedSearch || 
                     normalizedCellValue.includes(normalizedSearch) ||
                     normalizedSearch.includes(normalizedCellValue);
          }
          
          if (matches) {
            return {
              found: true,
              sheet: sheetName,
              row: row + 1, // Converter para base 1 para exibição
              col: XLSX.utils.encode_col(col),
              cellAddress: cellAddress,
              originalValue: cellValue
            };
          }
        }
      }
    }
  }

  return { found: false, message: 'Número de processo não encontrado na planilha' };
}

/**
 * Verifica se o número de processo existe nas planilhas A e B
 * @param {File} planilhaAFile - Arquivo da planilha A
 * @param {File} planilhaBFile - Arquivo da planilha B
 * @param {String} processNumber - Número do processo
 * @returns {Promise<Object>} - { found: boolean, foundInA: boolean, foundInB: boolean, details: Object }
 */
export async function verifyProcessNumber(planilhaAFile, planilhaBFile, processNumber) {
  if (!processNumber || !processNumber.trim()) {
    return {
      found: false,
      foundInA: false,
      foundInB: false,
      message: 'Número de processo não informado'
    };
  }

  try {
    // Ler planilhas
    const { workbook: workbookA } = await readPlanilhaA(planilhaAFile);
    const { workbook: workbookB } = await readPlanilhaB(planilhaBFile);

    // Buscar nas planilhas
    const resultA = searchProcessNumberInWorkbook(workbookA, processNumber);
    const resultB = searchProcessNumberInWorkbook(workbookB, processNumber);

    const foundInA = resultA.found;
    const foundInB = resultB.found;
    const found = foundInA || foundInB;

    return {
      found,
      foundInA,
      foundInB,
      details: {
        planilhaA: resultA,
        planilhaB: resultB
      },
      message: found 
        ? `Número de processo encontrado${foundInA && foundInB ? ' em ambas as planilhas' : foundInA ? ' na Planilha A' : ' na Planilha B'}`
        : 'Número de processo não encontrado em nenhuma das planilhas'
    };
  } catch (error) {
    console.error('Erro ao verificar número de processo:', error);
    return {
      found: false,
      foundInA: false,
      foundInB: false,
      message: `Erro ao verificar número de processo: ${error.message}`
    };
  }
}

/**
 * Processa ambas as planilhas com o índice INPC
 * @param {File} planilhaAFile - Arquivo da planilha A
 * @param {File} planilhaBFile - Arquivo da planilha B
 * @param {Number} inpcValue - Valor do índice INPC
 * @param {String} monthYear - Mês/Ano no formato YYYY-MM
 * @returns {Promise<Object>} - { planilhaA: Blob, planilhaB: Blob }
 */
export async function processarPlanilhasINPC(planilhaAFile, planilhaBFile, inpcValue, monthYear) {
  try {
    // Ler e validar planilhas
    const { workbook: workbookA } = await readPlanilhaA(planilhaAFile);
    const { workbook: workbookB } = await readPlanilhaB(planilhaBFile);

    // Aplicar INPC
    const processedA = applyINPCPlanilhaA(workbookA, inpcValue, monthYear);
    const processedB = applyINPCPlanilhaB(workbookB, inpcValue, monthYear);

    // Verificar se os workbooks foram processados corretamente
    if (!processedA || !processedB) {
      throw new Error('Erro ao processar planilhas: workbooks inválidos');
    }

    // Exportar
    const blobA = exportWorkbook(processedA, `Planilha_A_${monthYear}.xlsx`);
    const blobB = exportWorkbook(processedB, `Planilha_B_${monthYear}.xlsx`);

    // Verificar se os blobs foram criados
    if (!blobA || !blobB) {
      throw new Error('Erro ao exportar planilhas: blobs inválidos');
    }

    return {
      planilhaA: blobA,
      planilhaB: blobB,
      success: true
    };
  } catch (error) {
    console.error('Erro detalhado ao processar planilhas:', error);
    throw new Error(`Erro ao processar planilhas: ${error.message}`);
  }
}

