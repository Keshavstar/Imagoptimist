
import React, { useState } from 'react';

interface PricingProps {
  onValidateKey: (key: string) => Promise<void>;
}

const Pricing: React.FC<PricingProps> = ({ onValidateKey }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!key.trim()) return;
    setLoading(true);
    await onValidateKey(key.trim());
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
        <p className="text-slate-600">Free forever for basic use. Professional features for heavy users.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900">Standard</h3>
            <p className="text-slate-500 text-sm">Best for casual use</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-slate-500 text-sm">/ forever</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            {['1 Image at a time', 'Max 2MB per file', 'Standard Compression', 'Ad-supported'].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl font-bold border border-slate-200 text-slate-400 cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-blue-600 border border-blue-700 p-8 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">POPULAR</div>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white">Professional</h3>
            <p className="text-blue-100 text-sm">Unlock the full power</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$4.99</span>
              <span className="text-blue-100 text-sm">/ month</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            {[
              'Batch processing (20+ files)', 
              'Max 15MB per file', 
              'High-Res 4K Resizing', 
              'No Advertisements',
              'Faster priority processing',
              'Multi-device license'
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-blue-50">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all">
            Start Free Trial
          </button>
        </div>
      </div>

      {/* License Activation Section */}
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl max-w-2xl mx-auto">
        <h4 className="font-bold text-slate-900 mb-2">Already have a license?</h4>
        <p className="text-sm text-slate-600 mb-6">Enter your key below to unlock premium features across your devices.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="PREM-XXXX-XXXX-XXXX"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase font-mono"
          />
          <button 
            onClick={handleActivate}
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
