import React, { useEffect } from "react";
import Chat from "./components/chat/Chat";
import { Code } from "lucide-react";
import coreLogo from "./public/dark.png";

function App() {
  useEffect(() => {
    document.title = "Smart Contract Verifier";

    const titleElement = document.querySelector("title[data-default]");
    if (titleElement) {
      const link = document.querySelector('link[rel="icon"]');
      if (link) {
        link.setAttribute(
          "href",
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23FF9900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><rect x="4" y="7" width="16" height="5" /><line x1="5" y1="15" x2="8" y2="15" /><rect x="10" y="15" width="4" height="2" /></svg>'
        );
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-white ">
                <img
                  src={coreLogo}
                  alt="Core Logo"
                  className="w-30 h-12 color-orange"
                />
              </div>
            </div>
            <p className="ml-3 text-xl font-bold">Smart Contract Verifier</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="bg-primary-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-primary-800 dark:text-primary-400">
              Contract Verification Assistant
            </h2>
            <p className="text-sm text-white-600 dark:text-white-400">
              I'll guide you through verifying your smart contract's source code
            </p>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat />
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Smart Contract Verifier
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;
