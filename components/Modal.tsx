
import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedImage } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImage[];
  initialIndex: number;
  prompt: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, images, initialIndex, prompt }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const image = images[currentIndex];

    const handlePrev = useCallback(() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)), [images.length]);
    const handleNext = useCallback(() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)), [images.length]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (images.length > 1) {
                if (event.key === 'ArrowLeft') handlePrev();
                else if (event.key === 'ArrowRight') handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handlePrev, handleNext, images.length]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `bong-hong-trieu-do-${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/95 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-white/20">
                <div className="flex-shrink-0 md:w-3/5 bg-[#fff5f7] flex items-center justify-center p-2 relative">
                    {images.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="absolute left-4 z-10 p-4 bg-white/80 hover:bg-white rounded-full text-rose-500 shadow-xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={handleNext} className="absolute right-4 z-10 p-4 bg-white/80 hover:bg-white rounded-full text-rose-500 shadow-xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}
                    <img src={image.url} alt="Bóng hồng" className="object-contain w-full h-full max-h-[85vh] rounded-2xl allow-context-menu" draggable={false} />
                    {images.length > 1 && (
                        <div className="absolute bottom-6 bg-white/90 text-rose-600 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                            Nét vẽ {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col p-8 w-full md:w-2/5 text-zinc-900 bg-white">
                    <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-playfair font-bold text-rose-600">Kiệt tác nàng</h3>
                        <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-300 hover:text-rose-500">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="mt-8 space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Thần thái họa nét</h4>
                            <p className="text-sm text-zinc-600 bg-rose-50/50 p-4 rounded-2xl border border-rose-100 italic leading-relaxed">"{prompt}"</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-bold text-green-700">DỮ LIỆU NHÂN VẬT ĐÃ ĐƯỢC KHÓA (100%)</span>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        <button onClick={handleDownload} className="w-full bg-rose-600 text-white font-bold py-5 px-4 rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3 active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Lưu ảnh bóng hồng
                        </button>
                        <p className="text-[10px] text-center text-rose-300 font-medium">Nhấn giữ ảnh để lưu trực tiếp trên di động</p>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #fecdd3; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Modal;
