
import React, { useState, useCallback, useRef } from 'react';
// Added missing Link import for navigation
import { Link } from 'react-router-dom';
import { UserTier, UserSession, ImageFile } from '../types';
import AdBanner from './AdBanner';

interface ImageToolProps {
  session: UserSession;
  onValidateKey: (key: string) => Promise<void>;
}

const ImageTool: React.FC<ImageToolProps> = ({ session, onValidateKey }) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = session.tier === UserTier.PREMIUM;
  const FILE_SIZE_LIMIT = isPremium ? 15 * 1024 * 1024 : 2 * 1024 * 1024; // 15MB vs 2MB
  const MAX_FILES = isPremium ? 20 : 1;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > MAX_FILES) {
      alert(`Limit exceeded. ${isPremium ? 'Premium' : 'Free'} users can upload up to ${MAX_FILES} file(s).`);
      return;
    }

    const newFiles: ImageFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const compressImage = async (imageFile: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageFile.preview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...imageFile, status: 'error' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                ...imageFile,
                status: 'completed',
                compressedSize: blob.size,
                resultUrl: URL.createObjectURL(blob)
              });
            } else {
              resolve({ ...imageFile, status: 'error' });
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve({ ...imageFile, status: 'error' });
    });
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'pending') {
        updatedFiles[i] = { ...updatedFiles[i], status: 'processing' };
        setFiles([...updatedFiles]);
        
        // Premium users get faster processing (no synthetic delay)
        if (!isPremium) {
          await new Promise(r => setTimeout(r, 800)); // Simulated "Slow Priority"
        }
        
        const result = await compressImage(updatedFiles[i]);
        updatedFiles[i] = result;
        setFiles([...updatedFiles]);
      }
    }
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tool Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Smart Image Compressor
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Privacy-first processing. Your files never leave your browser. Fast, secure, and professional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
              files.length > 0 ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-300 hover:border-blue-400'
            }`}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple={isPremium} 
              onChange={onFileChange} 
            />
            
            {files.length === 0 ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-lg font-bold text-blue-600 hover:text-blue-700"
                  >
                    Click to upload
                  </button>
                  <p className="text-sm text-slate-500">
                    PNG, JPG, WebP (Max {formatSize(FILE_SIZE_LIMIT)})
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <img src={file.preview} className="w-12 h-12 rounded object-cover border" alt="preview" />
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.file.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatSize(file.originalSize)} 
                        {file.compressedSize && ` → ${formatSize(file.compressedSize)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <a 
                          href={file.resultUrl} 
                          download={`compressed-${file.file.name}`}
                          className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      )}
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="text-slate-400 hover:text-red-500 p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-bold text-blue-600"
                    disabled={files.length >= MAX_FILES}
                  >
                    + Add More
                  </button>
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing || files.every(f => f.status === 'completed')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 shadow-lg shadow-blue-200"
                  >
                    {isProcessing ? 'Processing...' : 'Start Compression'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 flex justify-between mb-2">
                  Quality <span>{Math.round(quality * 100)}%</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.05" 
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Resize</span>
                  <select className="w-full bg-transparent text-sm focus:outline-none" disabled={!isPremium}>
                    <option>Original</option>
                    <option disabled={!isPremium}>HD (1080p)</option>
                    <option disabled={!isPremium}>4K (Premium)</option>
                  </select>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 opacity-60">
                  <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Format</span>
                  <select className="w-full bg-transparent text-sm focus:outline-none">
                    <option>Maintain Original</option>
                    <option>Convert to WebP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isPremium && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
              <h4 className="font-bold text-amber-800 mb-2">Support Free Tools</h4>
              <p className="text-sm text-amber-700 mb-4 leading-relaxed">
                Free usage is limited and ad-supported. Upgrade for batch processing, high-res resizing, and faster speeds.
              </p>
              <Link to="/pricing" className="block text-center bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors">
                Unlock Premium
              </Link>
            </div>
          )}

          <AdBanner isPremium={isPremium} />

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Security Promise</h4>
            <ul className="space-y-3">
              {[
                "Zero Server Uploads",
                "GDPR Compliant",
                "No Data Collection",
                "Open Logic Architecture"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTool;
