import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            NexusAI
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#text" className="text-gray-300 hover:text-white transition-colors">
            Text
          </a>
          <a href="#image" className="text-gray-300 hover:text-white transition-colors">
            Images
          </a>
          <a href="#speech" className="text-gray-300 hover:text-white transition-colors">
            Speech
          </a>
        </nav>
      </div>
    </header>
  );
}
