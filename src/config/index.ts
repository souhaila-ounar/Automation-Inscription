import dotenv from "dotenv";
dotenv.config();

export const URL_BASE_TC = process.env.URL_BASE_TC!;
export const ourApiKey = process.env.API_KEY || "";
export const deepSeekKey = process.env.DEEPSEEK_KEY || "";
export const openAIKey = process.env.OPENAI_KEY || "";

export const config = {
  branchTokens: {
    3268: process.env.TOKEN_TUTORAX_TUTORAT || "",
    7673: process.env.TOKEN_TUTORAX_CANADA || "",
    8427: process.env.TOKEN_TUTORAX_ORTHOPEDAGOGIE || "",
    15751: process.env.TOKEN_TUTORAX_USA || "",
    14409: process.env.TOKEN_TUTORAX_ORTHOPHONIE || "",
    5737: process.env.TOKEN_TUTORAX_STIMULATION || "",
    3269: process.env.TOKEN_TUTORAX_ADMIN || "",
  },
};

export const jumelageEndpoint = process.env.PABBLY_ENDPOINT_JUMELAGE!;
export const creditCardEndpoint = process.env.PABBLY_ENDPOINT_CREDIT_CARD!;
export const addLabelInHomeEndpoint =
  process.env.PABBLY_ENDPOINT_ADD_LABEL_INHOME!;
