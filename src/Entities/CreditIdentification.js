// Entity schema for CreditIdentification
export const CreditIdentificationSchema = {
  name: "CreditIdentification",
  type: "object",
  properties: {
    process_number: {
      type: "string",
      description: "Número do processo"
    },
    debtor_name: {
      type: "string",
      description: "Nome do devedor"
    },
    cl_number: {
      type: "string",
      description: "Número do CL"
    },
    received_value: {
      type: "number",
      description: "Valor recebido"
    },
    receipt_date: {
      type: "string",
      format: "date",
      description: "Data de recebimento"
    },
    generated_text: {
      type: "string",
      description: "Texto gerado para AGE"
    },
    source_file_url: {
      type: "string",
      description: "URL do arquivo fonte"
    },
    source_file_name: {
      type: "string",
      description: "Nome do arquivo fonte"
    }
  },
  required: [
    "process_number",
    "debtor_name",
    "received_value",
    "receipt_date"
  ]
};

export default CreditIdentificationSchema;
