
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lead } from '../types';
import { Sparkles, Palette, Megaphone, Download, Copy, RefreshCw, Wand2, Image as ImageIcon, Instagram, Facebook, Linkedin, Loader2, Home, Share2, Check, FileText, Layout, ArrowRight, Target, List, Upload, X, Box, Layers } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface MarketingProps {
  leads: Lead[];
}

type StudioMode = 'creative' | 'visualizer';

export const Marketing: React.FC<MarketingProps> = ({ leads }) => {
  const [mode, setMode] = useState<StudioMode>('creative');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('General Market');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{data: string, type: string} | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<{ig: string, fb: string, li: string, flyer: {headline: string, body: string, features: string[]}} | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uniqueProperties = Array.from(new Set(leads.map(l => l.propertyAddress).filter(Boolean)));

  const AUDIENCE_OPTIONS = [
    'General Market',
    'First-time Homebuyers',
    'Real Estate Investors',
    'Luxury Market',
    'Retirees / Empty Nesters',
    'Young Professionals'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({
          data: (reader.result as string).split(',')[1],
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!description.trim() && !uploadedImage) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedCopy(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Generate Image using gemini-2.5-flash-image
      const imageParts: any[] = [];
      
      if (uploadedImage) {
        imageParts.push({
          inlineData: {
            data: uploadedImage.data,
            mimeType: uploadedImage.type
          }
        });
      }

      const promptText = mode === 'visualizer' 
        ? `Generate a photorealistic, ultra-high-end 3D architectural render based on this reference. ${uploadedImage ? 'Extrapolate the 3D building structure from this floor plan or building image.' : ''} Ensure the building is modern, luxury, and features professional evening lighting. Maintain structural integrity but add premium materials (glass, wood, polished concrete). Surround it with lush landscaping. Description: ${description}`
        : `A photorealistic, high-end architectural shot of this property: ${description}. Luxury real estate magazine style, evening twilight lighting, wide-angle lens, professional staging. If there are people, they should be professional African business people or families.`;

      imageParts.push({ text: promptText });

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: imageParts }],
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
        Target Audience: ${targetAudience}. 
        Visual Style Note: ${mode === 'visualizer' ? 'The visuals are generated 3D renders from floor plans/concepts.' : 'The visuals are architectural photography.'}
        Tone Guidance: 
        - If First-time Homebuyers: Focus on approachability, security, and the dream of ownership.
        - If Investors: Focus on ROI, yield, appreciation potential, and market fundamentals.
        - If Luxury: Use aspirational, sophisticated language, focusing on exclusivity and rare features.
        - If General: Balanced, professional, and highlight key property merits.
        
        Provide: 
        1. Instagram caption
        2. Facebook post
        3. LinkedIn professional update
        4. A formal Flyer text (Headline, Body, and exactly 3-5 Key Features).
        
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
                            features: { 
                                type: "ARRAY", 
                                items: { type: "STRING" },
                                minItems: 3,
                                maxItems: 5
                            }
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
          <p className="text-slate-500 mt-1">AI-powered property assets and 3D architectural visualizer.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button 
                onClick={() => setMode('creative')}
                className={cn(
                    "flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    mode === 'creative' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Palette className="w-4 h-4" /> Studio
            </button>
            <button 
                onClick={() => setMode('visualizer')}
                className={cn(
                    "flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    mode === 'visualizer' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Box className="w-4 h-4" /> 3D Visualizer
            </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-2xl overflow-hidden rounded-[32px]">
            <div className="h-1.5 w-full bg-slate-900" />
            <CardHeader className="pb-4 p-8">
              <CardTitle className="text-lg flex items-center gap-2">
                {mode === 'creative' ? <Wand2 className="w-5 h-5 text-slate-400" /> : <Layers className="w-5 h-5 text-slate-400" />}
                {mode === 'creative' ? 'Creative Brief' : '3D Component Upload'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                   {mode === 'visualizer' ? 'Floor Plan / Concept Image' : 'Optional Reference Image'}
                </label>
                {!uploadedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100/50 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                       <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Click to upload</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">PNG, JPG, SVG (Max 5MB)</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden aspect-video border border-slate-200 group bg-black">
                     <img src={`data:image/${uploadedImage.type};base64,${uploadedImage.data}`} alt="Upload" className="w-full h-full object-contain opacity-70" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={clearUpload} className="bg-rose-500 text-white p-3 rounded-2xl shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                     <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <p className="text-[9px] font-black text-white uppercase tracking-widest">Reference Locked</p>
                     </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {mode === 'visualizer' ? '3D Render Instructions' : 'Property Description'}
                </label>
                <textarea 
                  className="w-full h-32 p-5 rounded-3xl border border-slate-200 bg-slate-50 focus:bg-white transition-all text-sm resize-none focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-medium leading-relaxed"
                  placeholder={mode === 'visualizer' ? "E.g., Transform this floor plan into a luxury coastal villa with a cantilevered deck..." : "E.g., Ultra-modern 5-bedroom villa with infinity pool..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                   <Target className="w-3 h-3" /> Target Audience
                </label>
                <select 
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white transition-all text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 font-medium appearance-none"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  {AUDIENCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <Button 
                className="w-full h-16 rounded-[28px] bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:-translate-y-1 active:scale-[0.98] transition-all"
                onClick={handleGenerate}
                disabled={isGenerating || (!description.trim() && !uploadedImage)}
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Rendering...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-3 text-emerald-400" /> {mode === 'creative' ? 'Generate Studio Suite' : 'Extrapolate 3D Building'}</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#0f2925] text-white border-none shadow-2xl relative overflow-hidden rounded-[40px]">
             <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
             <CardContent className="p-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Box className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-200/40">3D Visualizer Tip</h4>
                <p className="text-sm text-teal-100/60 leading-relaxed font-medium">
                  Upload a 2D <span className="text-emerald-400">Floor Plan</span> to give Gemini structural constraints. The AI will interpret dimensions and generate a realistic exterior 3D render.
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
                  {mode === 'creative' 
                    ? 'Provide a property brief or upload a reference image to start generating marketing assets.'
                    : 'Upload a floor plan or building draft to generate a high-fidelity 3D architectural visualization.'}
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
                    <h3 className="text-4xl font-black text-white mb-2 tracking-tight">
                        {mode === 'creative' ? 'Gemini Studio Suite...' : 'Generative 3D Building...'}
                    </h3>
                    <p className="text-teal-100/40 text-xs font-black uppercase tracking-[0.3em]">Drafting Copy for {targetAudience}</p>
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
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            {mode === 'creative' ? 'AI Rendered Visualization' : 'Generative 3D Building Output'}
                         </p>
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
                              <div className="flex gap-4">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 rounded-2xl">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Re-Render
                                </Button>
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
                             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">Audience: {targetAudience}</h5>
                             <h3 className="text-3xl font-black leading-tight mb-10">{generatedCopy.flyer.headline}</h3>
                             
                             <div className="mb-4 flex items-center gap-2">
                                <List className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-teal-200/40">Key Features</span>
                             </div>
                             <div className="space-y-4">
                                {generatedCopy.flyer.features.map((feat, i) => (
                                   <div key={i} className="flex items-center gap-3 group/feat">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover/feat:scale-125 transition-transform" />
                                      <span className="text-xs font-bold text-slate-300 leading-tight">{feat}</span>
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Flyer Body Copy</p>
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
