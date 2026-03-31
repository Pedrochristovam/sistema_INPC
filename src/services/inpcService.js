import * as XLSX from 'xlsx';

/** Colunas de referência na Planilha A (VALOR ESTIMADO — BI, BJ, BK) */
const COL_BI = XLSX.utils.decode_col('BI');
const COL_BJ = XLSX.utils.decode_col('BJ');
const COL_BK = XLSX.utils.decode_col('BK');

/** Planilha B — destino dos valores calculados na A */
const COL_DQ = XLSX.utils.decode_col('DQ');
const COL_DR = XLSX.utils.decode_col('DR');
const COL_DS = XLSX.utils.decode_col('DS');

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

  // Referência fixa: colunas BI, BJ e BK (precisa existir range até BK)
  const sheetHasBI_BK = (sheet) => {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const cellAddresses = Object.keys(sheet).filter((k) => /^[A-Z]+[0-9]+$/i.test(k));
    const maxColFromCells = cellAddresses.reduce((max, addr) => {
      try {
        const { c } = XLSX.utils.decode_cell(addr);
        return Math.max(max, c);
      } catch {
        return max;
      }
    }, -1);

    return range.e.c >= COL_BK || maxColFromCells >= COL_BK;
  };

  const found = workbook.SheetNames.some((name) => {
    const sheet = workbook.Sheets[name];
    return sheetHasBI_BK(sheet);
  });

  if (!found) {
    errors.push('Planilha A deve conter as colunas de referência BI, BJ e BK (range até a coluna BK)');
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
 * Monta cabeçalho "VALOR ESTIMADO PARA …" com o mês/ano solicitado, a partir do texto de BI/BJ/BK.
 */
function buildValorEstimadoHeaderForMonth(original, monthUpper, year) {
  let h = String(original || '').trim();
  if (!h) {
    return `VALOR ESTIMADO PARA 30 DE ${monthUpper} DE ${year} CONFORME PARAMETROS DA LEI 18.002/2009.`;
  }
  // "PARA 30 DE ABRIL DE 2024" ou "PARA 30 DE ABRIL 2024"
  h = h.replace(
    /PARA\s+(\d+)\s+DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s+(DE\s+)?(\d{4})/gi,
    (_, dia) => `PARA ${dia} DE ${monthUpper} DE ${year}`
  );
  h = h.replace(
    /DE\s+(JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s+DE\s+(\d{4})/gi,
    `DE ${monthUpper} DE ${year}`
  );
  return h;
}

/**
 * Aplica o índice INPC na Planilha A: referências fixas BI, BJ, BK; três colunas novas após BK.
 * @returns {{ workbook: Object, tripleValues: { v1: number[], v2: number[], v3: number[] } }}
 */
export function applyINPCPlanilhaA(workbook, inpcValue, monthYear) {
  try {
    const mesesPt = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const [year, month] = monthYear.split('-');
    const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1));
    const monthName = mesesPt[monthIndex];
    const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const monthUpper = monthNameCapitalized.toUpperCase();

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error('Worksheet não encontrado');
    }

    let range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    const inpcValueParsed = parseFloat(inpcValue);
    const validInpcValue = isNaN(inpcValueParsed) || inpcValueParsed < 0 ? 0 : inpcValueParsed;
    const multiplier = 1 + (validInpcValue / 100);

    const headerBI = XLSX.utils.encode_cell({ r: 0, c: COL_BI });
    const headerBJ = XLSX.utils.encode_cell({ r: 0, c: COL_BJ });
    const headerBK = XLSX.utils.encode_cell({ r: 0, c: COL_BK });

    const originalHeader1 = String(worksheet[headerBI]?.v || '');
    const originalHeader2 = String(worksheet[headerBJ]?.v || '');
    const originalHeader3 = String(worksheet[headerBK]?.v || '');

    const newHeader1 = buildValorEstimadoHeaderForMonth(originalHeader1, monthUpper, year);
    const newHeader2 = buildValorEstimadoHeaderForMonth(originalHeader2, monthUpper, year);
    const newHeader3 = buildValorEstimadoHeaderForMonth(originalHeader3, monthUpper, year);

    const newCol1 = COL_BK + 1;
    const newCol2 = COL_BK + 2;
    const newCol3 = COL_BK + 3;

    worksheet[XLSX.utils.encode_cell({ r: 0, c: newCol1 })] = { v: newHeader1, t: 's' };
    worksheet[XLSX.utils.encode_cell({ r: 0, c: newCol2 })] = { v: newHeader2, t: 's' };
    worksheet[XLSX.utils.encode_cell({ r: 0, c: newCol3 })] = { v: newHeader3, t: 's' };

    const v1 = [];
    const v2 = [];
    const v3 = [];

    for (let row = 1; row <= range.e.r; row++) {
      const ref1 = XLSX.utils.encode_cell({ r: row, c: COL_BI });
      const ref2 = XLSX.utils.encode_cell({ r: row, c: COL_BJ });
      const ref3 = XLSX.utils.encode_cell({ r: row, c: COL_BK });
      const c1 = worksheet[ref1];
      const c2 = worksheet[ref2];
      const c3 = worksheet[ref3];

      const val1 = parseFloat(c1?.v) || 0;
      const val2 = parseFloat(c2?.v) || 0;
      const val3 = parseFloat(c3?.v) || 0;

      const nv1 = val1 * multiplier;
      const nv2 = val2 * multiplier;
      const nv3 = val3 * multiplier;

      worksheet[XLSX.utils.encode_cell({ r: row, c: newCol1 })] = {
        v: nv1,
        t: 'n',
        z: c1?.z || '#,##0.00'
      };
      worksheet[XLSX.utils.encode_cell({ r: row, c: newCol2 })] = {
        v: nv2,
        t: 'n',
        z: c2?.z || '#,##0.00'
      };
      worksheet[XLSX.utils.encode_cell({ r: row, c: newCol3 })] = {
        v: nv3,
        t: 'n',
        z: c3?.z || '#,##0.00'
      };

      v1.push(nv1);
      v2.push(nv2);
      v3.push(nv3);
    }

    range.e.c = Math.max(range.e.c, newCol3);
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    const refWidth = worksheet['!cols']?.[COL_BI]?.w || 12;
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    [newCol1, newCol2, newCol3].forEach((c) => {
      if (!worksheet['!cols'][c]) worksheet['!cols'][c] = { w: refWidth };
    });

    return {
      workbook,
      tripleValues: { v1, v2, v3 }
    };
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
 * Aplica valores na Planilha B: aba "Índice Mensal INPC", colunas DQ/DR/DS com os resultados da Planilha A.
 * @param {Object|null} tripleFromA - { v1, v2, v3 } arrays alinhados por linha (linha 1 = índice 0)
 */
export function applyINPCPlanilhaB(workbook, inpcValue, monthYear, tripleFromA = null) {
  const mesesPt = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const indexSheetName = findIndexSheet(workbook);
  const worksheet = workbook.Sheets[indexSheetName];

  if (!worksheet['!ref']) {
    throw new Error('Aba de índice está vazia');
  }

  let range = XLSX.utils.decode_range(worksheet['!ref']);

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

  const styleColDQ = worksheet[XLSX.utils.encode_cell({ r: 1, c: COL_DQ })];

  if (tripleFromA && tripleFromA.v1 && tripleFromA.v1.length > 0) {
    const maxRows = Math.min(range.e.r, tripleFromA.v1.length);
    const cols = [COL_DQ, COL_DR, COL_DS];
    const arrs = [tripleFromA.v1, tripleFromA.v2, tripleFromA.v3];

    for (let row = 1; row <= maxRows; row++) {
      const idx = row - 1;
      for (let k = 0; k < 3; k++) {
        const c = cols[k];
        const ref = XLSX.utils.encode_cell({ r: row, c });
        const prev = worksheet[ref];
        const val = arrs[k][idx] ?? 0;
        worksheet[ref] = {
          v: val,
          t: 'n',
          z: prev?.z || styleColDQ?.z || '#,##0.00'
        };
      }
    }

    range.e.c = Math.max(range.e.c, COL_DQ, COL_DR, COL_DS);
  } else {
    const { de, df, dg } = findColumnsDE_DF_DG([]);
    for (let row = 1; row <= range.e.r; row++) {
      const inpcCellRef = XLSX.utils.encode_cell({ r: row, c: inpcCol });
      const inpcCell = worksheet[inpcCellRef];
      if (inpcCell) {
        inpcCell.v = inpcValue;
        inpcCell.t = 'n';
      }
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
  }

  const lastMonthlyCol = findLastMonthlyColumn(worksheet, 0, range.e.c);
  const [year, month] = monthYear.split('-');
  const monthIndex = Math.max(0, Math.min(11, parseInt(month, 10) - 1));
  const monthName = mesesPt[monthIndex];
  const monthYearLabel = `${monthName}/${year}`;

  let targetMonthlyCol = null;
  for (let c = 0; c <= range.e.c; c++) {
    const headerRef = XLSX.utils.encode_cell({ r: 0, c });
    const headerCell = worksheet[headerRef];
    if (!headerCell || headerCell.v == null) continue;
    const headerValue = String(headerCell.v).trim().toLowerCase();
    if (headerValue === monthYearLabel.toLowerCase()) {
      targetMonthlyCol = c;
      break;
    }
  }

  if (targetMonthlyCol === null) {
    targetMonthlyCol = range.e.c + 1;
    worksheet[XLSX.utils.encode_cell({ r: 0, c: targetMonthlyCol })] = { v: monthYearLabel, t: 's' };
  }

  for (let row = 1; row <= range.e.r; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: targetMonthlyCol });
    const styleRefCol = lastMonthlyCol !== null ? lastMonthlyCol : inpcCol;
    const styleRef = XLSX.utils.encode_cell({ r: row, c: styleRefCol });
    const refCell = worksheet[styleRef];
    worksheet[cellRef] = {
      v: inpcValue,
      t: 'n',
      z: refCell?.z || '#,##0.00'
    };
  }

  range.e.c = Math.max(range.e.c, targetMonthlyCol);
  worksheet['!ref'] = XLSX.utils.encode_range(range);

  if (worksheet['!cols']) {
    const refColWidth = worksheet['!cols'][inpcCol]?.w || 12;
    if (!worksheet['!cols'][targetMonthlyCol]) {
      worksheet['!cols'][targetMonthlyCol] = { w: refColWidth };
    }
  } else {
    worksheet['!cols'] = [];
    worksheet['!cols'][targetMonthlyCol] = { w: 12 };
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

    const { workbook: processedA, tripleValues } = applyINPCPlanilhaA(workbookA, inpcValue, monthYear);
    const processedB = applyINPCPlanilhaB(workbookB, inpcValue, monthYear, tripleValues);

    if (!processedA || !processedB) {
      throw new Error('Erro ao processar planilhas: workbooks inválidos');
    }

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

