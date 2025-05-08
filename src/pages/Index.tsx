
import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ApiKeyEntry from '@/components/ApiKeyEntry';
import { Toaster } from "@/components/ui/toaster";
import { Upload } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is already stored
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-truck-dark-blue text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Upload className="h-6 w-6" />
            <h1 className="text-xl font-bold">LKW-GPT Appraisal Assistant</h1>
          </div>
          {apiKey && (
            <button 
              onClick={() => {
                localStorage.removeItem('openai_api_key');
                setApiKey(null);
              }}
              className="text-sm text-truck-yellow hover:underline"
            >
              API-Schlüssel ändern
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        {apiKey ? (
          <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <ChatInterface apiKey={apiKey} />
          </div>
        ) : (
          <ApiKeyEntry onApiKeySubmit={handleApiKeySubmit} />
        )}
      </main>
      
      <Toaster />
    </div>
  );
};

export default Index;
