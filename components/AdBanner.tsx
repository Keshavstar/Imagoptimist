
import React, { useState, useEffect } from 'react';

interface AdBannerProps {
  isPremium: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ isPremium }) => {
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    if (isPremium) return;
    
    // Simple ad-block detection logic (checks if an element with common ad classes is blocked)
    const test = document.createElement('div');
    test.innerHTML = '&nbsp;';
    test.className = 'adsbox';
    document.body.appendChild(test);
    window.setTimeout(() => {
      if (test.offsetHeight === 0) {
        setAdBlocked(true);
      }
      test.remove();
    }, 100);
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <div className="space-y-4">
      <div className="ad-placeholder w-full aspect-[4/3] rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden group">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest z-10">Advertisement</span>
        {/* Placeholder for real AdSense/Media.net script tag */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm group-hover:backdrop-blur-none transition-all"></div>
      </div>

      {adBlocked && (
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 mb-2">
            AdBlocker detected. This free tool is supported by minimal ads.
          </p>
          <a href="#/pricing" className="text-xs font-bold text-blue-600 underline">
            Go Ad-Free with Premium
          </a>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
