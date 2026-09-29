
import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  onConfirm: (file: File, url: string) => void;
  onUseOriginal: () => void;
}

const aspectRatios = [
    { value: 0.75, label: '3:4 Dọc' },
    { value: 9 / 16, label: '9:16 Story' },
    { value: 1 / 1, label: 'Vuông' },
    { value: undefined, label: 'Tự do' },
];

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<{file: File, url: string}> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Could not get canvas context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      },
      'image/jpeg',
      0.95
    );
  });
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imgSrc, onConfirm, onUseOriginal }) => {
  const [aspect, setAspect] = useState<number | undefined>(0.75);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialAspect = 0.75;
    const newCrop = centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            initialAspect,
            width,
            height
        ),
        width,
        height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }

  const handleConfirmCrop = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const {file, url} = await getCroppedImg(imgRef.current, completedCrop, 'cropped-beauty.jpg');
            onConfirm(file, url);
        } catch (e) {
            console.error(e);
            alert("Lỗi cắt ảnh.");
        }
    } else {
        alert("Vui lòng chọn vùng ảnh.");
    }
  }
  
  const handleSetAspect = (newAspect: number | undefined) => {
      setAspect(newAspect);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                newAspect || width / height,
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/95 backdrop-blur-xl flex items-center justify-center z-[110] p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
        
        {/* Top Navigation / Header */}
        <div className="p-4 sm:p-6 border-b border-pink-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <button onClick={onClose} className="text-zinc-400 hover:text-rose-500 transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-playfair font-bold text-rose-600">Chỉnh khung hình</h3>
            <button 
                onClick={handleConfirmCrop}
                className="bg-rose-500 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-rose-200 active:scale-95 transition-all"
            >
                XÁC NHẬN
            </button>
        </div>

        {/* Cropping Area */}
        <div className="flex-grow min-h-0 bg-[#fdf2f4] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
           {imgSrc && (
             <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden border-2 border-white"
            >
                <img ref={imgRef} alt="Crop" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '60vh', objectFit: 'contain' }} className="allow-context-menu"/>
            </ReactCrop>
           )}
        </div>

        {/* Bottom Controls */}
        <div className="p-6 bg-white space-y-6 pb-10 sm:pb-6">
            <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Chọn tỷ lệ ảnh</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {aspectRatios.map(ar => (
                        <button
                            key={ar.label}
                            onClick={() => handleSetAspect(ar.value)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 transition-all duration-300
                                ${aspect === ar.value ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-white border-pink-100 text-rose-300 hover:border-rose-300'}
                            `}
                        >
                            {ar.label}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={onUseOriginal} 
                className="w-full text-rose-400 font-bold py-3 text-xs uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
                Hoặc: Dùng nguyên ảnh gốc (không cắt)
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
