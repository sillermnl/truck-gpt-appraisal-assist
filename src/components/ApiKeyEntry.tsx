
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from 'lucide-react';

interface ApiKeyEntryProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyEntry = ({ onApiKeySubmit }: ApiKeyEntryProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "API-Schlüssel erforderlich",
        description: "Bitte geben Sie einen gültigen OpenAI API-Schlüssel ein.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Ungültiger API-Schlüssel');
      }

      toast({
        title: "API-Schlüssel validiert",
        description: "Verbindung zu OpenAI hergestellt.",
      });
      
      onApiKeySubmit(apiKey);
      
      // Save API key to localStorage for persistence
      localStorage.setItem('openai_api_key', apiKey);
    } catch (error) {
      console.error('API key validation error:', error);
      toast({
        title: "Fehler bei der API-Schlüssel-Validierung",
        description: "Bitte überprüfen Sie Ihren API-Schlüssel und versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-700 bg-[#1f2937] text-white">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-truck-yellow rounded-full p-4">
              <MessageSquare className="h-8 w-8 text-[#1a202c]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-truck-yellow">Willkommen bei Fahrzeug AI-Chat</CardTitle>
          <CardDescription className="text-gray-300 mt-2">
            Geben Sie Ihren OpenAI API-Schlüssel ein, um zu beginnen
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-gray-300">OpenAI API-Schlüssel</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  className="bg-[#2d3748] border-gray-600 text-white focus:border-truck-yellow focus:ring-truck-yellow"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            className="w-full bg-truck-yellow hover:bg-yellow-500 text-[#1a202c] font-medium"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Verbindung wird hergestellt..." : "Verbinden"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyEntry;
