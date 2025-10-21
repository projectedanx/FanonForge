import React, { useState, useCallback, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import type { AnalysisResult, TwistResult, RiskResult, Project } from './types';

// --- Helper & UI Components (defined outside App to prevent re-renders) ---

/**
 * Renders a sparkling icon.
 * @param {{ className?: string }} props The component props.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const IconSparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C11.45 2 11 2.45 11 3V4.05C9.81 4.41 8.78 5.15 8 6.09L7.3 5.39C6.91 5 6.28 5 5.89 5.39L5.39 5.89C5 6.28 5 6.91 5.39 7.3L6.09 8C5.15 8.78 4.41 9.81 4.05 11H3C2.45 11 2 11.45 2 12C2 12.55 2.45 13 3 13H4.05C4.41 14.19 5.15 15.22 6.09 16L5.39 16.7C5 17.09 5 17.72 5.39 18.11L5.89 18.61C6.28 19 6.91 19 7.3 18.61L8 17.91C8.78 18.85 9.81 19.59 11 19.95V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V19.95C14.19 19.59 15.22 18.85 16 17.91L16.7 18.61C17.09 19 17.72 19 18.11 18.61L18.61 18.11C19 17.72 19 17.09 18.61 16.7L17.91 16C18.85 15.22 19.59 14.19 19.95 13H21C21.55 13 22 12.55 22 12C22 11.45 21.55 11 21 11H19.95C19.59 9.81 18.85 8.78 17.91 8L18.61 7.3C19 6.91 19 6.28 18.61 5.89L18.11 5.39C17.72 5 17.09 5 16.7 5.39L16 6.09C15.22 5.15 14.19 4.41 13 4.05V3C13 2.45 12.55 2 12 2ZM12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7Z" />
  </svg>
);
/**
 * Renders a folder icon.
 * @param {{ className?: string }} props The component props.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const IconFolder: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
);
/**
 * Renders a microphone icon.
 * @param {{ className?: string }} props The component props.
 * @returns {JSX.Element} The rendered SVG icon.
 */
const IconMicrophone: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
    </svg>
);
/**
 * Renders a loading spinner.
 * @returns {JSX.Element} The rendered loader component.
 */
const Loader: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
  </div>
);
/**
 * Renders a disclaimer notice about the AI-generated content.
 * @returns {JSX.Element} The rendered disclaimer component.
 */
const Disclaimer: React.FC = () => (
  <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative my-4" role="alert">
    <strong className="font-bold">Advisory Notice: </strong>
    <span className="block sm:inline">This is an AI-generated advisory for creative exploration, not legal advice. Always consult with a legal professional for copyright matters.</span>
  </div>
);
/**
 * Renders a content section with a title and an optional icon.
 * @param {{ title: string; children: React.ReactNode; icon?: React.ReactNode }} props The component props.
 * @returns {JSX.Element} The rendered section component.
 */
const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-brand-accent mb-4 flex items-center">
            {icon || <IconSparkles className="w-6 h-6 mr-2" />} {title}
        </h2>
        {children}
    </div>
);

// --- Main App Component ---

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const LOCAL_STORAGE_KEY = 'fanonForgeProjects';
/**
 * The main application component for Fanon Forge.
 * It manages state for user inputs, API responses, and project data.
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  // --- Core State ---
  /**
   * @state {string} ipInput - The user's input describing the intellectual property.
   */
  const [ipInput, setIpInput] = useState<string>('');
  /**
   * @state {string} generatedText - The AI-generated narrative text.
   */
  const [generatedText, setGeneratedText] = useState<string>('');
  
  /**
   * @state {AnalysisResult | null} analysis - The analysis result of the source IP.
   */
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  /**
   * @state {TwistResult | null} twists - The generated transformative twists.
   */
  const [twists, setTwists] = useState<TwistResult | null>(null);
  /**
   * @state {string[] | null} tropes - The list of common fandom tropes.
   */
  const [tropes, setTropes] = useState<string[] | null>(null);
  /**
   * @state {RiskResult | null} risk - The copyright risk assessment of the generated text.
   */
  const [risk, setRisk] = useState<RiskResult | null>(null);
  /**
   * @state {Record<string, boolean>} isLoading - A record of loading states for various API calls.
   */
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  /**
   * @state {string | null} error - An error message to be displayed to the user.
   */
  const [error, setError] = useState<string | null>(null);
  
  // --- Narrative Divergence State ---
  /**
   * @state {string} narrativeLength - The desired length of the generated narrative.
   */
  const [narrativeLength, setNarrativeLength] = useState<string>('about 150-200 words');
  /**
   * @state {string} narrativeTone - The desired tone of the generated narrative.
   */
  const [narrativeTone, setNarrativeTone] = useState<string>('');

  // --- Voice Input State ---
  /**
   * @state {boolean} isListening - Whether the speech recognition is currently active.
   */
  const [isListening, setIsListening] = useState(false);
  /**
   * @state {boolean} isSpeechRecognitionSupported - Whether the browser supports the SpeechRecognition API.
   */
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- Project Management State ---
  /**
   * @state {Project[]} projects - The list of saved user projects.
   */
  const [projects, setProjects] = useState<Project[]>([]);
  
  // --- Effects ---
  useEffect(() => {
    // Load projects from localStorage on initial render
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            setProjects(JSON.parse(saved));
        }
    } catch (e) {
        console.error("Failed to load projects from localStorage", e);
        setError("Could not load saved projects. Your browser's storage might be full or corrupted.");
    }
    
    // Initialize Speech Recognition
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setIpInput(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

    }
  }, []);

  // --- Voice Input ---
  /**
   * Toggles the speech recognition listening state.
   */
  const handleToggleListening = () => {
    if (!isSpeechRecognitionSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  // --- Project Management ---
  /**
   * Updates the projects state and saves it to localStorage.
   * @param {Project[]} newProjects The new array of projects to save.
   */
  const updateProjects = (newProjects: Project[]) => {
      try {
          setProjects(newProjects);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProjects));
      } catch (e) {
          console.error("Failed to save projects to localStorage", e);
          setError("Could not save project. Your browser's storage may be full.");
      }
  };
  /**
   * Handles saving the current state as a new project.
   */
  const handleSaveProject = () => {
      const name = prompt("Enter a name for your project:");
      if (!name) return;

      const newProject: Project = {
          name,
          lastSaved: new Date().toISOString(),
          ipInput,
          generatedText,
          analysis,
          twists,
          tropes,
          risk,
      };

      const existingIndex = projects.findIndex(p => p.name === name);
      if (existingIndex > -1) {
          if (confirm(`A project named "${name}" already exists. Overwrite it?`)) {
              const updatedProjects = [...projects];
              updatedProjects[existingIndex] = newProject;
              updateProjects(updatedProjects);
          }
      } else {
          updateProjects([...projects, newProject]);
      }
  };
  /**
   * Handles loading a saved project's data into the application state.
   * @param {string} projectName The name of the project to load.
   */
  const handleLoadProject = (projectName: string) => {
      const projectToLoad = projects.find(p => p.name === projectName);
      if (projectToLoad) {
          setIpInput(projectToLoad.ipInput);
          setGeneratedText(projectToLoad.generatedText);
          setAnalysis(projectToLoad.analysis);
          setTwists(projectToLoad.twists);
          setTropes(projectToLoad.tropes);
          setRisk(projectToLoad.risk);
          alert(`Project "${projectName}" loaded.`);
      }
  };
  /**
   * Handles deleting a saved project.
   * @param {string} projectName The name of the project to delete.
   */
  const handleDeleteProject = (projectName: string) => {
      if (confirm(`Are you sure you want to delete the project "${projectName}"?`)) {
          const updatedProjects = projects.filter(p => p.name !== projectName);
          updateProjects(updatedProjects);
      }
  };

  // --- Gemini API Calls ---
  /**
   * A generic handler for making calls to the Gemini API.
   * Manages loading and error states for each call.
   * @template T The expected type of the API response.
   * @param {string} key A unique key to track the loading state of this specific call.
   * @param {() => Promise<T>} serviceFunc The API service function to call.
   * @param {(result: T) => void} onSuccess A callback to handle the successful API response.
   */
  const handleGeminiCall = useCallback(async <T,>(
    key: string,
    serviceFunc: () => Promise<T>,
    onSuccess: (result: T) => void
  ) => {
    setIsLoading(prev => ({ ...prev, [key]: true }));
    setError(null);
    try {
      const result = await serviceFunc();
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);
  /**
   * Initiates an analysis of the source IP.
   */
  const analyzeIP = () => {
    handleGeminiCall('analyze', () => geminiService.analyzeIP(ipInput), setAnalysis);
  };
  
  /**
   * Explores fandom tropes related to the source IP.
   */
  const exploreTropes = () => {
    handleGeminiCall('tropes', () => geminiService.exploreTropes(ipInput), setTropes);
  };
  /**
   * Generates transformative twists based on the source IP.
   */
  const generateTwists = () => {
    handleGeminiCall('twists', () => geminiService.generateTwists(ipInput), setTwists);
  };
  
  /**
   * Generates a narrative divergence based on the user's length and tone preferences.
   */
  const generateDivergence = () => {
      const prompt = `Suggest a 'what happened next?' scenario or a retelling from a different perspective. The narrative should be ${narrativeLength}. ${narrativeTone ? `The tone should be ${narrativeTone}.` : ''}`.trim();
      handleGeminiCall('divergence', () => geminiService.generateNarrative(ipInput, prompt), setGeneratedText);
  };
  
  /**
   * Generates a narrative with a specified level of deviation from the source material.
   * @param {'Low' | 'Medium' | 'High'} level The desired level of deviation.
   */
  const generateWithDeviation = (level: 'Low' | 'Medium' | 'High') => {
      const prompt = `Generate a short narrative based on the source material, but with a ${level.toLowerCase()} level of stylistic and thematic deviation to foster originality.`;
      handleGeminiCall(`deviation-${level}`, () => geminiService.generateNarrative(ipInput, prompt), setGeneratedText);
  };
  /**
   * Assesses the copyright risk of the generated narrative.
   */
  const assessRisk = () => {
    if (!generatedText) return;
    handleGeminiCall('risk', () => geminiService.assessRisk(ipInput, generatedText), setRisk);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <header className="bg-brand-primary/50 backdrop-blur-sm p-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white flex items-center">
                <IconSparkles className="w-8 h-8 mr-3 text-brand-accent"/>
                Fanon Forge
            </h1>
            <p className="text-brand-text-muted hidden md:block">Transformative Narratives with AI</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <Disclaimer />

        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}

        <Section title="My Projects" icon={<IconFolder className="w-6 h-6 mr-2" />}>
          <div className="flex flex-wrap items-center gap-4 mb-4">
              <button onClick={handleSaveProject} disabled={!ipInput} className="px-6 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                  Save Current Project
              </button>
          </div>
          {projects.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {projects.map(project => (
                      <div key={project.name} className="flex flex-wrap items-center justify-between bg-brand-primary/50 p-3 rounded-lg gap-2">
                          <div>
                              <p className="font-semibold">{project.name}</p>
                              <p className="text-sm text-brand-text-muted">Last saved: {new Date(project.lastSaved).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => handleLoadProject(project.name)} className="px-4 py-1 bg-green-700 text-white font-bold rounded hover:bg-green-600 transition-colors text-sm">Load</button>
                              <button onClick={() => handleDeleteProject(project.name)} className="px-4 py-1 bg-red-800 text-white font-bold rounded hover:bg-red-700 transition-colors text-sm">Delete</button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <p className="text-brand-text-muted">You have no saved projects. Input some source DNA and click "Save Current Project" to get started.</p>
          )}
        </Section>
        
        <Section title="1. Input Source IP">
            <p className="text-brand-text-muted mb-4">Enter a description of the IP (text, character, universe) you want to work with. You can type or use the microphone.</p>
            <textarea
                className="w-full h-48 p-4 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none resize-y"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="e.g., A young wizard with a lightning bolt scar discovers he is destined to fight an evil dark lord who cannot be named..."
            />
            <div className="flex flex-wrap items-center gap-4 mt-4">
                <button onClick={analyzeIP} disabled={!ipInput || isLoading.analyze} className="px-6 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading.analyze ? 'Analyzing...' : 'Analyze "Source DNA"'}
                </button>
                <button onClick={exploreTropes} disabled={!ipInput || isLoading.tropes} className="px-6 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-purple-800 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isLoading.tropes ? 'Exploring...' : 'Explore Fandom Tropes'}
                </button>
                 <button 
                    onClick={handleToggleListening} 
                    disabled={!isSpeechRecognitionSupported} 
                    className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-brand-secondary hover:bg-purple-800'} text-white disabled:bg-gray-600 disabled:cursor-not-allowed`}
                    title={isSpeechRecognitionSupported ? (isListening ? 'Stop Listening' : 'Start Listening') : 'Speech recognition not supported'}
                    aria-label="Toggle voice input"
                 >
                    <IconMicrophone className="w-5 h-5" />
                </button>
                {isListening && <span className="text-brand-accent">Listening...</span>}
            </div>
        </Section>
        
        {(analysis || tropes) && (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {analysis && (
                    <div className="bg-brand-surface rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-3 text-brand-accent">Source DNA Analysis</h3>
                        <div className="space-y-4 text-sm">
                            <div><strong className="block text-brand-text-muted">Characteristics:</strong> <p>{analysis.characteristics}</p></div>
                            <div><strong className="block text-brand-text-muted">Tropes:</strong> <p>{analysis.tropes}</p></div>
                            <div><strong className="block text-brand-text-muted">Motifs:</strong> <p>{analysis.motifs}</p></div>
                            <div><strong className="block text-brand-text-muted">Copyrightable Elements:</strong> <p>{analysis.copyrightableElements}</p></div>
                        </div>
                    </div>
                )}
                {tropes && (
                    <div className="bg-brand-surface rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-3 text-brand-accent">Common Fandom Tropes</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            {tropes.map((trope, i) => <li key={i}>{trope}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        )}

        <Section title="2. Generate Transformative Ideas">
            <p className="text-brand-text-muted mb-4">Use AI to spark new ideas and deviate from the source material.</p>
            <div className="space-y-6">
                 <div>
                    <button onClick={generateTwists} disabled={!ipInput || isLoading.twists} className="px-6 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-purple-800 transition-colors disabled:bg-gray-500">
                        {isLoading.twists ? 'Generating...' : 'Transformative Twist Engine'}
                    </button>
                    {twists && (
                        <div className="mt-6 bg-brand-primary/50 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Generated Twists:</h4>
                            <div className="space-y-3 text-sm">
                                {twists.conceptualBlending && <div><strong>Conceptual Blending:</strong> {twists.conceptualBlending}</div>}
                                {twists.dimensionalThinking && <div><strong>Dimensional Thinking:</strong> {twists.dimensionalThinking}</div>}
                                {twists.multiPerspective && <div><strong>Multi-Perspective:</strong> {twists.multiPerspective}</div>}
                                {twists.coreInversion && <div><strong>Core Inversion:</strong> {twists.coreInversion}</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-brand-primary/50 p-4 rounded-lg border border-brand-secondary/50">
                    <h4 className="font-bold text-lg mb-3">Narrative Divergence Prompter</h4>
                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="narrative-length" className="block text-sm font-medium text-brand-text-muted mb-1">Length</label>
                            <select 
                                id="narrative-length"
                                value={narrativeLength} 
                                onChange={e => setNarrativeLength(e.target.value)}
                                className="w-full p-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none h-10"
                            >
                                <option value="about 50 words">Short</option>
                                <option value="about 150-200 words">Medium</option>
                                <option value="about 300 words">Long</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="narrative-tone" className="block text-sm font-medium text-brand-text-muted mb-1">Tone (Optional)</label>
                            <input 
                                type="text" 
                                id="narrative-tone"
                                value={narrativeTone} 
                                onChange={e => setNarrativeTone(e.target.value)}
                                placeholder="e.g., Comedic, Mysterious"
                                className="w-full p-2 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none h-10"
                            />
                        </div>
                        <button onClick={generateDivergence} disabled={!ipInput || isLoading.divergence} className="px-6 py-2 bg-brand-secondary text-white font-bold rounded-lg hover:bg-purple-800 transition-colors disabled:bg-gray-500 h-10">
                            {isLoading.divergence ? 'Generating...' : 'Generate Divergence'}
                        </button>
                    </div>
                </div>
            </div>
        </Section>
        
        <Section title="3. Forge Your Narrative">
            <p className="text-brand-text-muted mb-4">Generate text with a controlled level of deviation from the original style.</p>
            <div className="flex flex-wrap gap-4 mb-4">
                <button onClick={() => generateWithDeviation('Low')} disabled={!ipInput || isLoading['deviation-Low']} className="px-6 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-500">
                     {isLoading['deviation-Low'] ? 'Forging...' : 'Low Deviation'}
                </button>
                <button onClick={() => generateWithDeviation('Medium')} disabled={!ipInput || isLoading['deviation-Medium']} className="px-6 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-500">
                    {isLoading['deviation-Medium'] ? 'Forging...' : 'Medium Deviation'}
                </button>
                <button onClick={() => generateWithDeviation('High')} disabled={!ipInput || isLoading['deviation-High']} className="px-6 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-500">
                    {isLoading['deviation-High'] ? 'Forging...' : 'High Deviation'}
                </button>
            </div>
            
             {(isLoading.divergence || isLoading['deviation-Low'] || isLoading['deviation-Medium'] || isLoading['deviation-High']) && <Loader />}

            {generatedText && (
                <div>
                    <textarea
                        className="w-full h-64 p-4 bg-brand-primary border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-accent focus:outline-none"
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                        readOnly={isLoading.risk}
                    />
                    <button onClick={assessRisk} disabled={!generatedText || isLoading.risk} className="mt-4 px-6 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-500">
                        {isLoading.risk ? 'Assessing...' : 'Assess Copyright Risk'}
                    </button>
                </div>
            )}

            {risk && (
                <div className="mt-6 bg-brand-primary/50 p-4 rounded-lg">
                    <h4 className="font-bold text-xl mb-2">Copyright Risk Analysis</h4>
                    <div className={`text-lg font-bold mb-2 ${risk.riskScore === 'Low' ? 'text-green-400' : risk.riskScore === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        Risk Score: {risk.riskScore}
                    </div>
                    <p className="text-sm mb-4"><strong className="text-brand-text-muted">Explanation:</strong> {risk.explanation}</p>
                    {risk.similarPassages && risk.similarPassages.length > 0 && (
                        <div>
                            <strong className="text-brand-text-muted">Highly Similar Passages:</strong>
                            <ul className="list-disc list-inside text-sm mt-2 bg-black/20 p-3 rounded">
                                {risk.similarPassages.map((passage, i) => <li key={i} className="italic">"{passage}"</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Section>
      </main>
    </div>
  );
}
