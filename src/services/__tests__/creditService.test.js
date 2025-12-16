/**
 * Testes básicos para o serviço de crédito
 */

import {
  validateExtractedData,
  normalizeCreditData,
  generateAGEText
} from '../creditService';

describe('Credit Service', () => {
  describe('validateExtractedData', () => {
    it('deve validar dados completos', () => {
      const data = {
        process_number: '0000123-45.2023.4.01.0001',
        debtor_name: 'João Silva',
        received_value: 15000.00,
        receipt_date: '2024-01-15'
      };

      const result = validateExtractedData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('deve rejeitar dados incompletos', () => {
      const data = {
        process_number: '',
        debtor_name: 'Jo',
        received_value: 0
      };

      const result = validateExtractedData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('normalizeCreditData', () => {
    it('deve normalizar dados corretamente', () => {
      const rawData = {
        process_number: '  0000123-45.2023.4.01.0001  ',
        debtor_name: '  João Silva  ',
        cl_number: '12.345',
        received_value: '15000.50',
        receipt_date: '2024-01-15',
        source_file: 'anexo.pdf'
      };

      const result = normalizeCreditData(rawData);
      
      expect(result.process_number).toBe('0000123-45.2023.4.01.0001');
      expect(result.debtor_name).toBe('João Silva');
      expect(result.received_value).toBe(15000.50);
    });
  });

  describe('generateAGEText', () => {
    it('deve gerar texto formatado corretamente', () => {
      const data = {
        process_number: '0000123-45.2023.4.01.0001',
        debtor_name: 'João Silva',
        cl_number: '12.345',
        received_value: 15000.00,
        receipt_date: '2024-01-15'
      };

      const text = generateAGEText(data);
      
      expect(text).toContain('Assunto: Identificação de crédito');
      expect(text).toContain('Processo: 0000123-45.2023.4.01.0001');
      expect(text).toContain('João Silva');
      expect(text).toContain('R$');
      expect(text).toContain('15.000,00');
    });

    it('deve usar valores padrão quando dados estão faltando', () => {
      const data = {
        process_number: '0000123-45.2023.4.01.0001',
        debtor_name: 'João Silva',
        received_value: 15000.00
      };

      const text = generateAGEText(data);
      
      expect(text).toContain('XX.XXX');
      expect(text).toContain('__/__/____');
    });
  });
});




