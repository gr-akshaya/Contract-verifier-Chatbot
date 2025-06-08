import React from 'react';
import { VerificationResult } from '../../types';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface VerificationResultProps {
  result: VerificationResult | null;
  isLoading: boolean;
  explorerUrl?: string;
}

const VerificationResultDisplay: React.FC<VerificationResultProps> = ({
  result,
  isLoading,
  explorerUrl,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <Loader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Verifying Contract
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This may take a few moments...
        </p>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.status === '1';

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${
      isSuccess 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
          ) : (
            <XCircle size={24} className="text-red-600 dark:text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium ${
            isSuccess ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {isSuccess ? 'Verification Successful' : 'Verification Failed'}
          </h3>
          <div className="mt-2 text-sm">
            <p className={isSuccess ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {result.message}
            </p>
          </div>
          
          {isSuccess && explorerUrl && (
            <div className="mt-4">
              <a 
                href={explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View on Explorer
                <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationResultDisplay;