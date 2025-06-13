import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SpeechGenerator() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate/speech", { text });
      return response.json();
    },
    onSuccess: (data) => {
      setAudioUrl(data.result.url);
      toast({
        title: "Speech Generated",
        description: "Your audio has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!text.trim() || generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Speech"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] border rounded bg-gray-900 flex items-center justify-center">
            {audioUrl ? (
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-gray-400">Generated audio will appear here...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
