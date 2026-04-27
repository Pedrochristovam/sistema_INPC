/**
 * Testes básicos para o serviço de INPC
 * Para executar: npm test ou npm run test
 */

import {
  validatePlanilhaA,
  validatePlanilhaB,
  applyINPCPlanilhaA,
  applyINPCPlanilhaB,
  processarPlanilhasINPC,
  parseInpcInput,
  multiplierFromInpc
} from '../inpcService';
import * as XLSX from 'xlsx';

describe('INPC Service', () => {
  describe('parseInpcInput / multiplierFromInpc', () => {
    it('interpreta formato BR com zeros e vírgula decimal', () => {
      expect(parseInpcInput('0001,0005000')).toBeCloseTo(1.0005, 6);
      expect(multiplierFromInpc(1.0005)).toBeCloseTo(1.0005, 6);
    });
    it('percentual menor que 1 vira fator 1 + p/100', () => {
      expect(multiplierFromInpc(0.52)).toBeCloseTo(1.0052, 6);
    });
  });

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
    it('deve validar planilha B com estrutura correta (BI–BK)', () => {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha B');

      const result = validatePlanilhaB(workbook);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar planilha sem BI–BK', () => {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Mapeamento B');

      const result = applyINPCPlanilhaB(workbook, 0.52, '2024-01');

      expect(result).toBeDefined();
      expect(result.SheetNames.length).toBeGreaterThan(0);
    });
  });
});



