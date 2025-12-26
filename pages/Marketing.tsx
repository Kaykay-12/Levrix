
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lead } from '../types';
import { Sparkles, Palette, Megaphone, Download, Copy, RefreshCw, Wand2, Image as ImageIcon, Instagram, Facebook, Linkedin, Loader2, Home, Share2, Check, FileText, Layout, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface MarketingProps {
  leads: Lead[];
}

export const Marketing: React.FC<MarketingProps> = ({ leads }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<{ig: string, fb: string, li: string, flyer: {headline: string, body: string, features: string[]}} | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const uniqueProperties = Array.from(new Set(leads.map(l => l.propertyAddress).filter(Boolean)));

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedCopy(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Generate Image using gemini-2.5-flash-image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: `A photorealistic, high-end architectural shot of this property: ${description}. Luxury real estate magazine style, evening twilight lighting, wide-angle lens, professional staging.` }],
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      let base64Image = '';
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      setGeneratedImage(base64Image);

      // 2. Generate Copy using gemini-3-flash-preview
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create marketing assets for this property: ${description}. 
        Provide: 
        1. Instagram caption
        2. Facebook post
        3. LinkedIn professional update
        4. A formal Flyer text (Headline, Body, and 5 Key Features).
        Format as JSON.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    ig: { type: "STRING" },
                    fb: { type: "STRING" },
                    li: { type: "STRING" },
                    flyer: {
                        type: "OBJECT",
                        properties: {
                            headline: { type: "STRING" },
                            body: { type: "STRING" },
                            features: { type: "ARRAY", items: { type: "STRING" } }
                        },
                        required: ["headline", "body", "features"]
                    }
                },
                required: ["ig", "fb", "li", "flyer"]
            }
        }
      });

      const copyData = JSON.parse(textResponse.text || '{}');
      setGeneratedCopy(copyData);

    } catch (error) {
      console.error("Marketing generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Marketing Studio</h2>
          <p className="text-slate-500 mt-1">Generate AI-powered property flyers and social assets.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-2xl overflow-hidden rounded-[32px]">
            <div className="h-1.5 w-full bg-slate-900" />
            <CardHeader className="pb-4 p-8">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-slate-400" /> Creative Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Description</label>
                <textarea 
                  className="w-full h-48 p-5 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white transition-all text-sm resize-none focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-medium leading-relaxed"
                  placeholder="E.g., Ultra-modern 5-bedroom villa with infinity pool, smart home features, and panoramic city views in Accra..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {uniqueProperties.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From Pipeline</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueProperties.slice(0, 4).map((prop, i) => (
                      <button 
                        key={i}
                        onClick={() => setDescription(prop || '')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-bold transition-all border border-slate-200"
                      >
                        {prop}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-16 rounded-[28px] bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:-translate-y-1 active:scale-[0.98] transition-all"
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Rendering...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-3 text-amber-400" /> Generate Studio Suite</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#0f2925] text-white border-none shadow-2xl relative overflow-hidden rounded-[40px]">
             <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
             <CardContent className="p-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Wand2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-200/40">Studio Tip</h4>
                <p className="text-sm text-teal-100/60 leading-relaxed font-medium">
                  Detailed architectural descriptors like "brutalist concrete," "scandinavian wood," or "floor-to-ceiling glass" will significantly improve the rendering accuracy.
                </p>
             </CardContent>
          </Card>
        </div>

        {/* Display Area */}
        <div className="lg:col-span-8">
          {!isGenerating && !generatedImage && (
            <div className="h-full min-h-[600px] border-2 border-dashed border-slate-200 rounded-[64px] flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm">
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                  <ImageIcon className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Studio Idle</h3>
               <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed font-medium">
                  Provide a property brief to start generating high-resolution visualizations and multi-channel copy.
               </p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[600px] bg-slate-900 rounded-[64px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent animate-pulse" />
               <div className="relative z-10 space-y-8">
                  <div className="w-28 h-28 bg-white/10 rounded-[48px] flex items-center justify-center border border-white/10 mx-auto animate-bounce">
                    <Sparkles className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white mb-2 tracking-tight">Gemini Creating...</h3>
                    <p className="text-teal-100/40 text-xs font-black uppercase tracking-[0.3em]">Drafting Copy & Rendering Assets</p>
                  </div>
                  <div className="w-64 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/2 animate-loading-bar rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </div>
               </div>
            </div>
          )}

          {(generatedImage || generatedCopy) && !isGenerating && (
            <div className="space-y-10 animate-in fade-in duration-700 pb-12">
               {/* Image Preview */}
               {generatedImage && (
                 <Card className="overflow-hidden border-none shadow-3xl rounded-[64px] bg-slate-900 group relative">
                   <div className="absolute top-8 left-8 z-20">
                      <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Rendered Visualization</p>
                      </div>
                   </div>
                   <div className="relative aspect-video w-full overflow-hidden">
                      <img src={generatedImage} alt="AI Generated Property" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-12 flex flex-col justify-end">
                          <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-white font-black text-2xl tracking-tight">Ready for Listing</h4>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">High-Resolution Architectural Concept</p>
                              </div>
                              <a 
                                href={generatedImage} 
                                download="property-concept.png" 
                                className="bg-white text-slate-900 h-14 px-8 rounded-2xl flex items-center gap-3 font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                <Download className="w-5 h-5" /> Download
                              </a>
                          </div>
                      </div>
                   </div>
                 </Card>
               )}

               {/* Flyer Preview */}
               {generatedCopy?.flyer && (
                 <Card className="border-none shadow-2xl rounded-[48px] overflow-hidden bg-white">
                    <div className="flex flex-col md:flex-row h-full">
                       <div className="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                          <div className="relative z-10">
                             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">Property Flyer</h5>
                             <h3 className="text-3xl font-black leading-tight mb-8">{generatedCopy.flyer.headline}</h3>
                             <div className="space-y-4">
                                {generatedCopy.flyer.features.map((feat, i) => (
                                   <div key={i} className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                      <span className="text-xs font-bold text-slate-300">{feat}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="relative z-10 pt-10">
                             <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-12 rounded-2xl">
                                <FileText className="w-4 h-4 mr-2" /> PDF Export
                             </Button>
                          </div>
                       </div>
                       <div className="flex-1 p-10 flex flex-col justify-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Brochure Content</p>
                          <p className="text-lg text-slate-700 leading-relaxed font-medium italic">"{generatedCopy.flyer.body}"</p>
                          <div className="mt-8 flex gap-4">
                             <button 
                                onClick={() => copyToClipboard(generatedCopy.flyer.body, 'flyer')}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                             >
                                {copiedTab === 'flyer' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                Copy Text
                             </button>
                          </div>
                       </div>
                    </div>
                 </Card>
               )}

               {/* Social Copy Previews */}
               {generatedCopy && (
                 <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { id: 'ig', label: 'Instagram', icon: <Instagram className="w-5 h-5" />, text: generatedCopy.ig, color: 'text-pink-600 bg-pink-50' },
                      { id: 'fb', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, text: generatedCopy.fb, color: 'text-blue-600 bg-blue-50' },
                      { id: 'li', label: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, text: generatedCopy.li, color: 'text-indigo-600 bg-indigo-50' }
                    ].map((platform) => (
                      <Card key={platform.id} className="border-slate-100 shadow-xl flex flex-col hover:border-emerald-500/20 transition-all rounded-[32px] overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 p-8 border-b border-slate-50">
                          <div className={cn("p-3 rounded-2xl border border-slate-100 shadow-sm", platform.color)}>
                            {platform.icon}
                          </div>
                          <button 
                            onClick={() => copyToClipboard(platform.text, platform.id)}
                            className="text-slate-300 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-50"
                          >
                            {copiedTab === platform.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </CardHeader>
                        <CardContent className="flex-1 p-8">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{platform.label} Caption</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-[10] whitespace-pre-wrap italic">
                            {platform.text}
                          </p>
                        </CardContent>
                        <div className="p-6 bg-slate-50/50 text-center">
                           <button 
                              onClick={() => copyToClipboard(platform.text, platform.id)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                           >
                             {copiedTab === platform.id ? 'Saved to Clipboard' : 'Copy Content'}
                           </button>
                        </div>
                      </Card>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
