
import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ApiKeyEntry from '@/components/ApiKeyEntry';
import { Toaster } from "@/components/ui/toaster";
import { MessageSquare } from 'lucide-react';

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
    <div className="min-h-screen bg-[#1a202c] flex flex-col">
      <header className="bg-[#131926] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-truck-yellow" />
            <h1 className="text-xl font-bold text-truck-yellow">Fahrzeug-KI Assistent</h1>
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
      
      <div className="bg-[#1a202c] text-white p-4 border-b border-gray-700">
        <div className="container mx-auto">
          <h2 className="text-xl">Fahrzeug AI-Chat</h2>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        {apiKey ? (
          <div className="bg-[#1f2937] rounded-lg shadow-lg p-4 h-[calc(100vh-12rem)]">
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
