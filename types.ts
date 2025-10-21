export interface AnalysisResult {
  characteristics: string;
  tropes: string;
  motifs: string;
  copyrightableElements: string;
}

export interface TwistResult {
  conceptualBlending: string;
  dimensionalThinking: string;
  multiPerspective: string;
  coreInversion: string;
}

export interface RiskResult {
  riskScore: 'Low' | 'Medium' | 'High';
  explanation: string;
  similarPassages: string[];
}

export interface Project {
  name: string;
  lastSaved: string; // ISO string
  ipInput: string;
  generatedText: string;
  analysis: AnalysisResult | null;
  twists: TwistResult | null;
  tropes: string[] | null;
  risk: RiskResult | null;
}
