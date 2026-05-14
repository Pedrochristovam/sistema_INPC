/**
 * Testes básicos para o serviço de INPC
 * Para executar: npm test ou npm run test
 */

import {
  validatePlanilhaA,
  validatePlanilhaB,
  applyINPCPlanilhaA,
  applyINPCPlanilhaB,
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

    it('usa o último trio VALOR ESTIMADO como base e o último dia do mês selecionado no cabeçalho', () => {
      const workbook = XLSX.utils.book_new();
      const bi = XLSX.utils.decode_col('BI');
      const bj = XLSX.utils.decode_col('BJ');
      const bk = XLSX.utils.decode_col('BK');
      const bl = XLSX.utils.decode_col('BL');
      const bm = XLSX.utils.decode_col('BM');
      const bn = XLSX.utils.decode_col('BN');
      const bo = XLSX.utils.decode_col('BO');
      const n = bn + 1;
      const row0 = Array(n).fill('');
      const row1 = Array(n).fill(0);
      row0[bi] =
        'VALOR ESTIMADO PARA 28 DE FEVEREIRO DE 2026 CONFORME PARAMETROS DA LEI 18.002/2009.';
      row0[bj] =
        'VALOR ESTIMADO PARA 28 DE FEVEREIRO DE 2026 PARA PAGAMENTO À VISTA CONFORME PARAMETROS DA LEI 18.002/2009';
      row0[bk] =
        'VALOR ESTIMADO PARA 28 DE FEVEREIRO DE 2026 COM O MENOR DESCONTO CONFORME PARAMETROS DA LEI 18.002/2009';
      row0[bl] =
        'VALOR ESTIMADO PARA 31 DE MARÇO DE 2026 CONFORME PARAMETROS DA LEI 18.002/2009.';
      row0[bm] =
        'VALOR ESTIMADO PARA 31 DE MARÇO DE 2026 PARA PAGAMENTO À VISTA CONFORME PARAMETROS DA LEI 18.002/2009';
      row0[bn] =
        'VALOR ESTIMADO PARA 31 DE MARÇO DE 2026 COM O MENOR DESCONTO CONFORME PARAMETROS DA LEI 18.002/2009';
      row1[bi] = 10;
      row1[bj] = 20;
      row1[bk] = 30;
      row1[bl] = 1000;
      row1[bm] = 2000;
      row1[bn] = 3000;
      const worksheet = XLSX.utils.aoa_to_sheet([row0, row1]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const { workbook: out } = applyINPCPlanilhaA(workbook, 1.0081, '2026-04');
      const ws = out.Sheets.Sheet1;
      const hRef = XLSX.utils.encode_cell({ r: 0, c: bo });
      const vRef = XLSX.utils.encode_cell({ r: 1, c: bo });
      expect(String(ws[hRef].v)).toMatch(/30\s+DE\s+ABRIL/i);
      expect(ws[vRef].v).toBeCloseTo(1008.1, 4);
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



