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
      const worksheet = XLSX.utils.aoa_to_sheet([
        Array(135).fill('').map((_, i) => {
          const col = XLSX.utils.encode_col(i);
          return col === 'EJ' ? 'INPC' : `Col${col}`;
        }),
        Array(135).fill(0)
      ]);
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
      const worksheet = XLSX.utils.aoa_to_sheet([
        Array(135).fill('').map((_, i) => {
          const col = XLSX.utils.encode_col(i);
          return col === 'EJ' ? 'INPC' : `Col${col}`;
        }),
        Array(135).fill(0)
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const result = applyINPCPlanilhaA(workbook, 0.52, '2024-01');
      
      expect(result).toBeDefined();
      expect(result.SheetNames.length).toBeGreaterThan(0);
    });
  });

  describe('applyINPCPlanilhaB', () => {
    it('deve aplicar índice INPC na planilha B', () => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Índice Mensal INPC', 'DE', 'DF', 'DG'],
        [0, 0, 0, 0]
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Índice Mensal INPC');

      const result = applyINPCPlanilhaB(workbook, 0.52, '2024-01');
      
      expect(result).toBeDefined();
      expect(result.SheetNames.length).toBeGreaterThan(0);
    });
  });
});




