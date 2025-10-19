import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnvironment, logValidationResults, createEnvironmentErrorMessage } from "./utils/env-validation";

// Validate environment variables before starting the app
const validationResult = validateEnvironment();
logValidationResults(validationResult);

// If environment is invalid, show error message instead of app
if (!validationResult.isValid) {
  const errorMessage = createEnvironmentErrorMessage(validationResult);
  const errorElement = document.createElement('div');
  errorElement.style.cssText = `
    font-family: 'Inter', monospace;
    max-width: 600px;
    margin: 50px auto;
    padding: 30px;
    background: #fff5f5;
    border: 2px solid #fed7d7;
    border-radius: 12px;
    color: #c53030;
    line-height: 1.6;
  `;
  errorElement.innerHTML = `
    <h2 style="color: #c53030; margin-top: 0;">🔧 Environment Setup Required</h2>
    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; background: #f7fafc; padding: 15px; border-radius: 6px; overflow-x: auto;">${errorMessage}</pre>
    <p style="margin-top: 20px;"><strong>Next steps:</strong></p>
    <ol style="margin-left: 20px;">
      <li>Check your <code>.env</code> file in the project root</li>
      <li>Copy values from <code>.env.backup</code> if you have one</li>
      <li>Refer to <code>ENVIRONMENT_SETUP.md</code> for detailed instructions</li>
      <li>Restart the development server after making changes</li>
    </ol>
  `;
  document.getElementById("root")!.appendChild(errorElement);
} else {
  // Environment is valid, start the app normally
  createRoot(document.getElementById("root")!).render(<App />);
}
