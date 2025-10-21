/**
 * Represents the result of an IP analysis.
 */
export interface AnalysisResult {
  /**
   * Latent characteristics of the IP.
   */
  characteristics: string;
  /**
   * Common tropes found in the IP.
   */
  tropes: string;
  /**
   * Recurring motifs in the IP.
   */
  motifs: string;
  /**
   * Specific elements that might be copyrightable.
   */
  copyrightableElements: string;
}

/**
 * Represents a set of generated transformative twists.
 */
export interface TwistResult {
  /**
   * A twist based on conceptual blending.
   */
  conceptualBlending: string;
  /**
   * A twist based on dimensional thinking.
   */
  dimensionalThinking: string;
  /**
   * A twist based on a multi-perspective approach.
   */
  multiPerspective: string;
  /**
   * A twist based on inverting a core concept.
   */
  coreInversion: string;
}

/**
 * Represents the result of a copyright risk assessment.
 */
export interface RiskResult {
  /**
   * The assessed risk score.
   */
  riskScore: 'Low' | 'Medium' | 'High';
  /**
   * An explanation for the assigned risk score.
   */
  explanation: string;
  /**
   * Any passages in the generated text that are highly similar to the source IP.
   */
  similarPassages: string[];
}

/**
 * Represents a saved project.
 */
export interface Project {
  /**
   * The name of the project.
   */
  name: string;
  /**
   * The ISO string representation of the last save date.
   */
  lastSaved: string; // ISO string
  /**
   * The source IP input for the project.
   */
  ipInput: string;
  /**
   * The generated text for the project.
   */
  generatedText: string;
  /**
   * The analysis result for the project, if any.
   */
  analysis: AnalysisResult | null;
  /**
   * The generated twists for the project, if any.
   */
  twists: TwistResult | null;
  /**
   * The explored tropes for the project, if any.
   */
  tropes: string[] | null;
  /**
   * The risk assessment for the project, if any.
   */
  risk: RiskResult | null;
}
