
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Image, Upload, MessageSquare } from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
}

interface ChatInterfaceProps {
  apiKey: string;
}

const ChatInterface = ({ apiKey }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [progress, setProgress] = useState(0); // Tracking conversation progress
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Speech recognition setup with proper type handling
  let recognition: any = null;

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about webkit prefixed version
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(prev => transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Fehler bei der Spracherkennung",
          description: `${event.error}. Bitte versuchen Sie es erneut.`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    // Greet the user with initial message
    setTimeout(() => {
      setMessages([{
        role: 'assistant', 
        content: 'Willkommen bei Fahrzeug AI-Chat! Ich bin Ihr Assistent für die Fahrzeugbegutachtung. Können Sie mir bitte einige grundlegende Informationen zu dem Fahrzeug geben, das Sie bewerten möchten? Zum Beispiel Marke, Modell und Erstzulassungsjahr.'
      }]);
    }, 500);

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [toast]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !fileInputRef.current?.files?.length) return;
    
    let newMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    // Handle file attachments if any
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      try {
        const base64 = await convertFileToBase64(file);
        newMessage.attachments = [base64];
      } catch (error) {
        console.error('Error converting file:', error);
        toast({
          title: "Fehler beim Hochladen",
          description: "Das Bild konnte nicht verarbeitet werden.",
          variant: "destructive",
        });
      }
    }

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsLoading(true);

    try {
      // Construct message history for the API
      const messageHistory = [
        {
          role: "system",
          content: `Du bist ein Verkaufsassistent für ein LKW-Verkaufsportal. Du führst den Nutzer durch einen strukturierten Fragebaum, bestehend aus vordefinierten Multiple-Choice-Optionen und offenen Textfeldern.

Ziel ist es, mindestens **80 %** der über 100 Fragen zu beantworten. Sobald dies erreicht ist, erzeugst du eine **TXT-Datei**, die ausschließlich aus den gegebenen Antworten im Format
question.variablenname Antwortstring besteht – also der internen Bezeichner-Logik folgend, ohne Erklärungen, UI-Text oder Zusatzinfos.

**Beachte folgende Regeln:**

* Jede Frage besteht aus einer **Variablenbezeichnung** und einem UI-Anzeigetext (Frontend-Label).
* Antworten sind entweder:

  * **Multiple Choice**, in dem Format: - question.variable.option.option\_name Frontend-Antwort
  * **Textfelder**, bei denen einfach question.variablenname Antwortstring gespeichert wird
* Wiederhole keine Fragen, wenn sie bereits beantwortet wurden.
* Du beendest den Frageprozess **automatisch**, sobald 80 % der Fragen beantwortet wurden.
* Du gibst **keine Erklärungen oder Kommentare** aus, sobald du die Datei generierst – nur die Antworten im obigen Format.

Beispiel:

question.frame\_ruststate.option.frame\_ruststate\_rustnest entstehende Rostnester
question.tms\_freetext Fahrzeug war im Winterbetrieb in Tirol und hat daher Streusalzspuren

Der User soll niemals die Variablenbezeichnung sehen außer in dem finalen Klartextblock. Daher nutze immer die Frontendlabels

Starte am Anfang mit einer offenen Frage und erkundige dich um die ersten Daten des Fahrzeugs
Sei höflich und motivierend
Wenn dir der User viele Informationen auf einmal gibt, versuche die Antworten dementsprechend zuzuordnen
Stelle jede Frage aber schau darauf, dass ein angenehmer Gesprächsfluss bleibt.
Bedeutet du kannst auch mehrere Fragen gleichzeitig Stellen. Halte dich dabei immer kurz und präzise.
Biete Antwortoptionen nur dann an falls es über das Allgemeinwissen eines Durschnittsuser hinausgeht als Liste an (bei Auswahlfragen) oder bitte um Freitext, wenn keine Antwortoption existiert.
Basierend auf den vorherigen Antworten, Liste dann nur die wahrscheinlichsten Antwortmöglichkeiten auf
Versuche die wichtigsten Fragen zuerst beantworten: Erstzulassung, Marke, Modell, Fahrzeugtyp, KM-Stand, Zustand, Funktionstüchtigkeit, Land der Zulassung, HU und falls nötig SP, Reifenprofil
Falls HU bzw TÜV gültig, frage auch bis wann also welches Monat
Wenn du dir antworten herleiten kannst dann versuche es aber frage immer bei herleitungen nach ner Bestätigung
Tracke intern, wie viele Fragen bereits beantwortet wurden, und höre bei 80 % auf.
Dursuche dann da Internet ob du etwas zu dem Fahrzeug im Fragebaum ergänzen kannst, falls nicht, alles ok!
Bei question.year\_of\_manufacture kann nur eine Jahreszahl eingeben werden
Am Ende der Konversation exportierst du die Antworten als Klartextblock im beschriebenen Format.`
        },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: "user", content: newMessage.content }
      ];

      // If there's an image attachment, we need to include it in the message
      if (newMessage.attachments?.length) {
        const imageMessage = {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: newMessage.attachments[0]
              }
            }
          ]
        };
        
        // Need to cast to 'any' to bypass TypeScript's strict typing here
        // as the API accepts this format but our type definition doesn't
        messageHistory.push(imageMessage as any);
      }

      // Make API request to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messageHistory,
          max_tokens: 1000,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;
      
      // Estimate progress based on response content
      if (assistantResponse.includes("80%") || assistantResponse.includes("80 %")) {
        setProgress(80);
      } else if (assistantResponse.includes("question.")) {
        // If we see a formatted answer, we're likely close to completion
        setProgress(Math.min(95, progress + 5));
      } else {
        // Gradually increase progress as conversation continues
        setProgress(Math.min(75, progress + 3));
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantResponse
      }]);
    } catch (error) {
      console.error('Error sending message to API:', error);
      toast({
        title: "Fehler bei der Kommunikation",
        description: "Es konnte keine Verbindung zur KI hergestellt werden. Bitte überprüfen Sie Ihre API-Einstellungen und Internetverbindung.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      } else {
        toast({
          title: "Spracherkennung nicht unterstützt",
          description: "Ihr Browser unterstützt die Spracherkennung nicht. Bitte verwenden Sie einen aktuelleren Browser oder geben Sie Ihre Nachricht als Text ein.",
          variant: "destructive",
        });
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-truck-yellow h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a202c] rounded-lg"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-truck-yellow rounded-full p-6 mb-4">
              <MessageSquare className="h-10 w-10 text-[#1a202c]" />
            </div>
            <h2 className="text-2xl font-bold text-truck-yellow mb-3">Willkommen bei Fahrzeug AI-Chat</h2>
            <p className="text-gray-300 mb-8 max-w-md">
              Lade ein Bild deines Fahrzeugs hoch (JPG oder PNG) und erhalte sofort KI-gestützte Informationen.
            </p>
            <div 
              className="border-2 border-dashed border-gray-500 rounded-lg p-8 cursor-pointer hover:border-truck-yellow transition-colors"
              onClick={triggerFileUpload}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Klicke hier oder ziehe eine Datei hierher, um ein Bild hochzuladen</p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              "message-container",
              message.role === "user" ? "user-message" : "assistant-message"
            )}
          >
            {message.role === "user" && message.attachments && (
              <div className="mb-2">
                <img 
                  src={message.attachments[0]} 
                  alt="Uploaded file" 
                  className="max-w-full max-h-64 rounded-lg" 
                />
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message-container assistant-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4 bg-[#1f2937] rounded-lg p-3 flex flex-col">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stelle eine Frage oder lade ein Bild hoch..."
          className="min-h-[60px] resize-none border-0 focus-visible:ring-0 bg-[#2d3748] text-white placeholder-gray-400"
          disabled={isLoading}
        />
        
        <div className="flex items-center justify-between pt-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={cn("bg-transparent border-gray-600 hover:bg-gray-700", isListening && "bg-red-900 border-red-700")}
              disabled={isLoading}
              type="button"
            >
              <Mic className={cn("h-4 w-4 text-gray-300", isListening && "text-red-400")} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={triggerFileUpload}
              disabled={isLoading}
              type="button"
              className="bg-transparent border-gray-600 hover:bg-gray-700"
            >
              <Image className="h-4 w-4 text-gray-300" />
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={() => {
                  toast({
                    title: "Bild erfolgreich hochgeladen",
                    description: "Klicken Sie auf Senden, um es zu analysieren.",
                  });
                }}
              />
            </Button>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={isLoading || (!input.trim() && !fileInputRef.current?.files?.length)}
            className="bg-truck-yellow hover:bg-yellow-500 text-[#1a202c]"
          >
            Senden <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
