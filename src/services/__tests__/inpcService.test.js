/**
 * Testes básicos para o serviço de INPC
 * Para executar: npm test ou npm run test
 */

import {
  validatePlanilhaA,
  validatePlanilhaB,
  applyINPCPlanilhaA,
  applyINPCPlanilhaB,
  processarPlanilhasINPC
} from '../inpcService';
import * as XLSX from 'xlsx';

describe('INPC Service', () => {
  describe('validatePlanilhaA', () => {
    it('deve validar planilha A com estrutura correta', () => {
      const workbook = XLSX.utils.book_new();
      const n = XLSX.utils.decode_col('BK') + 1;
      const row0 = Array(n).fill('');
      const row1 = Array(n).fill(0);
      const bi = XLSX.utils.decode_col('BI');
      const bj = XLSX.utils.decode_col('BJ');
      const bk = XLSX.utils.decode_col('BK');
      row0[bi] = 'VALOR ESTIMADO ...';
      row0[bj] = 'VALOR ESTIMADO ...';
      row0[bk] = 'VALOR ESTIMADO ...';
      const worksheet = XLSX.utils.aoa_to_sheet([row0, row1]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const result = validatePlanilhaA(workbook);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar planilha vazia', () => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const result = validatePlanilhaA(workbook);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePlanilhaB', () => {
    it('deve validar planilha B com aba de índice', () => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([['Índice Mensal INPC'], [0]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Índice Mensal INPC');

      const result = validatePlanilhaB(workbook);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar planilha sem aba de índice', () => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([['Dados'], [0]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

      const result = validatePlanilhaB(workbook);
      expect(result.isValid).toBe(false);
    });
  });

  describe('applyINPCPlanilhaA', () => {
    it('deve aplicar índice INPC na planilha A', () => {
      const workbook = XLSX.utils.book_new();
      const n = XLSX.utils.decode_col('BK') + 1;
      const row0 = Array(n).fill('');
      const row1 = Array(n).fill(0);
      const bi = XLSX.utils.decode_col('BI');
      const bj = XLSX.utils.decode_col('BJ');
      const bk = XLSX.utils.decode_col('BK');
      row0[bi] = 'VALOR ESTIMADO PARA 30 DE JANEIRO DE 2024 CONFORME PARAMETROS DA LEI 18.002/2009.';
      row0[bj] = 'VALOR ESTIMADO PARA 30 DE JANEIRO DE 2024 PARA PAGAMENTO À VISTA CONFORME PARAMETROS DA LEI 18.002/2009';
      row0[bk] = 'VALOR ESTIMADO PARA 30 DE JANEIRO DE 2024 COM O MENOR DESCONTO CONFORME PARAMETROS DA LEI 18.002/2009';
      row1[bi] = 100;
      row1[bj] = 200;
      row1[bk] = 300;
      const worksheet = XLSX.utils.aoa_to_sheet([row0, row1]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const result = applyINPCPlanilhaA(workbook, 0.52, '2024-01');

      expect(result).toBeDefined();
      expect(result.workbook.SheetNames.length).toBeGreaterThan(0);
      expect(result.tripleValues.v1.length).toBe(1);
    });
  });

  describe('applyINPCPlanilhaB', () => {
    it('deve aplicar índice INPC na planilha B', () => {
      const workbook = XLSX.utils.book_new();
      const dq = XLSX.utils.decode_col('DQ');
      const nCols = dq + 3;
      const row0 = Array(nCols).fill('');
      const row1 = Array(nCols).fill(0);
      row0[0] = 'Índice Mensal INPC';
      row0[dq] = 'DQ';
      row0[dq + 1] = 'DR';
      row0[dq + 2] = 'DS';
      const worksheet = XLSX.utils.aoa_to_sheet([row0, row1]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Índice Mensal INPC');

      const triple = { v1: [10], v2: [20], v3: [30] };
      const result = applyINPCPlanilhaB(workbook, 0.52, '2024-01', triple);

      expect(result).toBeDefined();
      expect(result.SheetNames.length).toBeGreaterThan(0);
    });
  });
});



