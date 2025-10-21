<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Fanon Forge

Fanon Forge is a web-based application designed to help creators, writers, and fans generate transformative narratives and explore creative ideas based on existing intellectual properties (IPs). Using AI, it analyzes source material, suggests creative twists, and generates new text while providing a copyright risk assessment.

View your app in AI Studio: https://ai.studio/apps/drive/1UMoIclTpO9IDqvzEAcBcPDGXBzgnOaa6

## Purpose

The primary purpose of Fanon Forge is to provide a tool for creative exploration and content generation. It helps users:
-   **Analyze Source Material**: Understand the core characteristics, tropes, and motifs of an existing IP.
-   **Spark Creativity**: Generate unique ideas and "what-if" scenarios to overcome creative blocks.
-   **Generate Narratives**: Create new stories with varying levels of deviation from the source material.
-   **Assess Copyright Risk**: Get an advisory, non-legal assessment of how similar the generated text is to the original IP.

## Usage

1.  **Input Source IP**: In the "Input Source IP" section, enter a detailed description of the intellectual property you want to work with. This can be a summary of a plot, a character description, or a description of a fictional universe.
2.  **Analyze and Explore**:
    *   Click **Analyze "Source DNA"** to get a breakdown of the IP's characteristics, tropes, motifs, and copyrightable elements.
    *   Click **Explore Fandom Tropes** to get a list of common fan-created tropes associated with the IP.
3.  **Generate Ideas**:
    *   Click **Transformative Twist Engine** to generate four different types of creative twists.
    *   Use the **Narrative Divergence Prompter** to generate a "what happened next" scenario with a specified length and tone.
4.  **Forge Your Narrative**:
    *   Click the **Low, Medium, or High Deviation** buttons to generate a narrative with a controlled level of stylistic and thematic deviation from the source material.
    *   Once a narrative is generated, you can edit it in the text area.
    *   Click **Assess Copyright Risk** to get an analysis of the generated text's similarity to the source IP.
5.  **Project Management**:
    *   Click **Save Current Project** to save your work.
    *   Load or delete saved projects from the "My Projects" section.

## Run Locally

**Prerequisites:** Node.js

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/fanon-forge.git
    cd fanon-forge
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    Create a file named `.env` in the root of the project and add your Gemini API key:
    ```
    API_KEY=your_gemini_api_key
    ```
4.  **Run the app**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Project Structure

*   `public/`: Contains the `index.html` file and other static assets.
*   `src/`: Contains the main source code for the application.
    *   `services/`: Contains the `geminiService.ts` file, which handles all interactions with the Gemini API.
    *   `App.tsx`: The main React component that renders the application's UI and manages its state.
    *   `index.tsx`: The entry point of the React application.
    *   `types.ts`: Contains TypeScript type definitions for the application's data structures.
*   `.gitignore`: Specifies which files and directories to ignore in version control.
*   `package.json`: Defines the project's dependencies and scripts.
*   `README.md`: This file.
*   `tsconfig.json`: The TypeScript configuration file.
*   `vite.config.ts`: The configuration file for the Vite build tool.
