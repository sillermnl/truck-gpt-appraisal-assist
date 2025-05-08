
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-truck-dark-blue border">
        <CardHeader className="text-center bg-truck-dark-blue text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">LKW-GPT Appraisal Assistant</CardTitle>
          <CardDescription className="text-gray-200">
            Geben Sie Ihren OpenAI API-Schlüssel ein, um zu beginnen
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API-Schlüssel</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-truck-dark-blue hover:bg-truck-blue"
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
