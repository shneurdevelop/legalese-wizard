
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, CheckCircle, Copy } from "lucide-react";

interface ApiKeyInputProps {
  onSave?: (key: string) => void;
}

const ApiKeyInput = ({ onSave }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("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");
  const [savedApiKey, setSavedApiKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load API key from local storage or use default
    const storedKey = localStorage.getItem("lawai-openai-key");
    if (storedKey) {
      setApiKey(storedKey);
      setSavedApiKey(storedKey);
    } else {
      // Auto-save the default key if none is set
      saveApiKey();
    }
  }, []);

  const saveApiKey = () => {
    try {
      localStorage.setItem("lawai-openai-key", apiKey);
      setSavedApiKey(apiKey);
      
      // Show success animation
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      toast.success("מפתח ה-API נשמר בהצלחה");
      
      if (onSave) {
        onSave(apiKey);
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("שגיאה בשמירת מפתח ה-API");
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "*".repeat(key.length);
    return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const copyApiKey = () => {
    if (savedApiKey) {
      navigator.clipboard.writeText(savedApiKey)
        .then(() => toast.success("מפתח ה-API הועתק ללוח"))
        .catch(() => toast.error("שגיאה בהעתקת מפתח ה-API"));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey" className="text-base font-medium">מפתח OpenAI API</Label>
      <div className="flex gap-2">
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="הזן את מפתח ה-API שלך כאן..."
          className="flex-1"
        />
        <Button 
          onClick={saveApiKey} 
          className="relative gap-2"
          disabled={saveSuccess}
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-100" />
              <span>נשמר!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              שמור
            </>
          )}
        </Button>
      </div>
      {savedApiKey && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <div>מפתח שמור: {maskApiKey(savedApiKey)}</div>
          <Button variant="ghost" size="sm" onClick={copyApiKey} className="h-6 px-2">
            <Copy className="h-3.5 w-3.5 mr-1" />
            העתק
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
