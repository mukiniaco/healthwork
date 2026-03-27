export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export interface CompanyData {
  name: string;
  cnpj: string;
  cnae: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  sector: string;
  role: string;
}

export interface RiskInput {
  freeText: string;
}

export interface RiskClassification {
  level: RiskLevel;
  score: number;
  justification: string;
  detectedRisks: string[];
}

export interface ActionPlan {
  measure: string;
  responsible: string;
  deadline: string;
  priority: 'Baixa' | 'Média' | 'Alta';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  bio?: string;
  avatar?: string;
  company: CompanyData;
  riskProfile: RiskClassification;
  actionPlan: ActionPlan[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  likedByMe?: boolean;
  reposts: number;
  repostedByMe?: boolean;
  repostedFrom?: {
    authorName: string;
    content: string;
  };
  comments: Comment[];
  tags: string[];
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}
