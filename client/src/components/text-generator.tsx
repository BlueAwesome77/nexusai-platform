import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate/text", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result.text);
      toast({
        title: "Text Generated",
        description: "Your content has been generated successfully.",
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
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
          />
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!prompt.trim() || generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Text"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] p-4 border rounded bg-gray-900 text-white">
            {result || "Generated text will appear here..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
