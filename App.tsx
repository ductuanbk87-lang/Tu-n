
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ConceptSelector from './components/ConceptSelector';
import DreamHousePanel from './components/DreamHousePanel';
import CustomPromptInput from './components/CustomPromptInput';
import ResultGrid from './components/ResultGrid';
import LoadingModal from './components/LoadingModal';
import { CONCEPTS, DREAM_HOUSE_CONCEPTS, LOADING_QUOTES } from './constants';
import { generatePortraits } from './services/geminiService';
import type { GeneratedImage } from './types';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(CONCEPTS[0].key);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [houseRefImage, setHouseRefImage] = useState<{ file: File, preview: string } | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isFaceLockEnabled, setIsFaceLockEnabled] = useState<boolean>(true);
  const [withFlowers, setWithFlowers] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedImage({ file, preview: previewUrl });
    setError(null);
  };

  const handleHouseImageUpload = (file: File | null, preview: string | null) => {
    if (file && preview) {
      setHouseRefImage({ file, preview });
    } else {
      setHouseRefImage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh rõ mặt nhất của nàng lên.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      let baseConceptPrompt = '';
      if (selectedHouse) {
        const houseData = DREAM_HOUSE_CONCEPTS.find(h => h.key === selectedHouse);
        baseConceptPrompt = houseData?.prompt || '';
      } else if (selectedConcept) {
        const conceptData = CONCEPTS.find(c => c.key === selectedConcept);
        baseConceptPrompt = conceptData?.prompt || '';
      }
      
      const fullPrompt = `${baseConceptPrompt}${customPrompt ? `, ${customPrompt}` : ''}.`;
      setFinalPrompt(fullPrompt);

      const imageBase64 = await fileToBase64(uploadedImage.file);
      let houseRefBase64 = undefined;
      if (houseRefImage) {
        houseRefBase64 = await fileToBase64(houseRefImage.file);
      }
      
      const params = {
        prompt: fullPrompt,
        negativePrompt: 'blurry, grainy, deformed, distorted, ugly, disfigured, poorly drawn, extra limbs, bad anatomy, mutated, watermark, signature, text, multiple people, low quality, cartoon, anime, plastic, fake, airbrushed',
        aspectRatio: '3:4' as const,
        imageBase64,
        mimeType: uploadedImage.file.type,
        numberOfImages: 2 as const,
        isFaceLockEnabled: isFaceLockEnabled,
        withFlowers: withFlowers,
        houseRefBase64: houseRefBase64
      };

      const results = await generatePortraits(params);
      setGeneratedImages(results);

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi kiến tạo vẻ đẹp.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedConcept, selectedHouse, houseRefImage, customPrompt, isFaceLockEnabled, withFlowers]);

  const isGenerateDisabled = isLoading || !uploadedImage;

  return (
    <div className="min-h-screen bg-[#fff5f7] text-zinc-900 pb-12">
      <LoadingModal isOpen={isLoading} quotes={LOADING_QUOTES} />
      
      <header className="text-center pt-10 pb-6">
        <h1 className="text-6xl font-playfair font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent tracking-tighter drop-shadow-sm px-4">
          APP TẠO ẢNH VIP CỦA NÔNG DÂN CONTENT
        </h1>
        <p className="text-rose-400 mt-3 font-medium tracking-widest uppercase text-xs">Vẻ đẹp tự nhiên - Chân thực tuyệt đối</p>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            preview={uploadedImage?.preview || null} 
            isFaceLockEnabled={isFaceLockEnabled}
            onToggleFaceLock={setIsFaceLockEnabled}
            withFlowers={withFlowers}
            onToggleWithFlowers={setWithFlowers}
          />
          <ConceptSelector 
            selectedConcept={selectedConcept} 
            onSelectConcept={(key) => { setSelectedConcept(key); setSelectedHouse(null); }} 
          />
          <CustomPromptInput customPrompt={customPrompt} onCustomPromptChange={setCustomPrompt} />
          
          <DreamHousePanel 
            selectedHouse={selectedHouse}
            onSelectHouse={(key) => { setSelectedHouse(key); if (key) setSelectedConcept(null); }}
            onHouseImageUpload={handleHouseImageUpload}
            housePreview={houseRefImage?.preview || null}
          />

          <div className="mt-2">
            {error && <p className="text-red-500 text-sm text-center mb-4 font-medium">{error}</p>}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`w-full text-white font-bold py-5 px-4 rounded-2xl transition-all duration-500 text-xl tracking-wide shadow-xl
                ${isGenerateDisabled 
                  ? 'bg-rose-200 text-rose-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:shadow-rose-200 active:scale-95'
                }`}
            >
              {isLoading ? 'Đang họa nét kiệt tác...' : 'Kiến tạo chân dung ngay'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ResultGrid 
            isLoading={isLoading} 
            images={generatedImages} 
            prompt={finalPrompt}
            numberOfImages={2}
          />
        </div>
      </main>

      <footer className="text-center p-8 text-rose-300 text-sm">
        <p className="font-playfair italic">"Vẻ đẹp chân thực nhất là khi nàng là chính mình."</p>
        <p className="mt-2 opacity-60">© 2024 APP TẠO ẢNH VIP CỦA NÔNG DÂN CONTENT - Created by Phong Menly</p>
      </footer>
    </div>
  );
};

export default App;
