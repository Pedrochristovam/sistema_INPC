// Entity schema for INPCUpdate
export const INPCUpdateSchema = {
  name: "INPCUpdate",
  type: "object",
  properties: {
    month_year: {
      type: "string",
      description: "Mês/Ano da atualização (MM/AAAA)"
    },
    inpc_value: {
      type: "number",
      description: "Valor do índice INPC informado"
    },
    planilha_a_url: {
      type: "string",
      description: "URL da Planilha A processada"
    },
    planilha_b_url: {
      type: "string",
      description: "URL da Planilha B processada"
    },
    status: {
      type: "string",
      enum: [
        "processing",
        "completed",
        "error"
      ],
      default: "processing"
    },
    error_message: {
      type: "string",
      description: "Mensagem de erro se houver"
    }
  },
  required: [
    "month_year",
    "inpc_value"
  ]
};

export default INPCUpdateSchema;
