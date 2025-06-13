import Header from "@/components/header";
import Footer from "@/components/footer";
import TextGenerator from "@/components/text-generator";
import ImageGenerator from "@/components/image-generator";
import SpeechGenerator from "@/components/speech-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            NexusAI Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Multi-modal AI content generation with text, image, and speech synthesis capabilities
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text Generation</TabsTrigger>
            <TabsTrigger value="image">Image Generation</TabsTrigger>
            <TabsTrigger value="speech">Speech Synthesis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="mt-8">
            <TextGenerator />
          </TabsContent>
          
          <TabsContent value="image" className="mt-8">
            <ImageGenerator />
          </TabsContent>
          
          <TabsContent value="speech" className="mt-8">
            <SpeechGenerator />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
