
import React from 'react';

interface CustomPromptInputProps {
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ customPrompt, onCustomPromptChange }) => {
  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl border-pink-100">
      <h2 className="text-xl font-playfair font-bold text-rose-600 mb-4">3. Mong muốn riêng của nàng</h2>
      <textarea
        value={customPrompt}
        onChange={(e) => onCustomPromptChange(e.target.value)}
        placeholder="Nàng muốn mặc váy màu gì? Tóc uốn hay thẳng? Đeo trang sức nào?..."
        className="w-full h-24 p-4 bg-white/50 border border-pink-100 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all text-sm text-zinc-900 resize-none placeholder-rose-200 outline-none"
        aria-label="Custom prompt details"
      />
    </div>
  );
};

export default CustomPromptInput;
