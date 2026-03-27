import { GoogleGenAI } from "@google/genai";
import { RiskClassification, ActionPlan, RiskInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFreeTextRisk(input: RiskInput): Promise<RiskClassification> {
  const prompt = `
    Como um especialista em Segurança do Trabalho, analise o seguinte relato de um trabalhador sobre seu ambiente de trabalho:
    Relato: "${input.freeText}"

    Identifique os riscos presentes e retorne um JSON com:
    - level: 'Baixo', 'Médio', 'Alto' ou 'Crítico' (baseado no risco mais grave detectado)
    - score: número de 1 a 25 representando a severidade geral
    - detectedRisks: uma lista de strings com os nomes dos riscos identificados (ex: 'Ruído', 'Postura Inadequada', 'Risco Elétrico')
    - justification: uma análise técnica resumida do relato e por que essa classificação foi dada.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao analisar texto livre:", error);
    return {
      level: 'Médio',
      score: 10,
      detectedRisks: ['Análise pendente'],
      justification: "Não foi possível realizar a análise detalhada no momento."
    };
  }
}

export async function generateActionPlanFromAnalysis(classification: RiskClassification): Promise<ActionPlan[]> {
  const prompt = `
    Com base na análise de riscos abaixo, gere um plano de ação preventivo:
    Riscos Detectados: ${classification.detectedRisks.join(', ')}
    Nível de Risco: ${classification.level}
    Análise: ${classification.justification}

    Retorne um JSON que seja uma lista de objetos com:
    - measure: a medida de controle sugerida
    - responsible: cargo sugerido para o responsável
    - deadline: prazo sugerido
    - priority: 'Baixa', 'Média' ou 'Alta'
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar plano de ação:", error);
    return [{
      measure: "Realizar inspeção técnica no posto de trabalho",
      responsible: "Técnico de Segurança",
      deadline: "7 dias",
      priority: "Alta"
    }];
  }
}

export async function generateSocialPost(topic: string) {
  const prompt = `Gere um post curto para uma rede social de Segurança do Trabalho sobre o tema: ${topic}. O post deve ser informativo e engajador. Retorne apenas o texto do post.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}
