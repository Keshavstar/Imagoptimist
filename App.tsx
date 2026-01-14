
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageTool from './components/ImageTool';
import Pricing from './components/Pricing';
import Legal from './components/Legal';
import { UserTier, UserSession } from './types';
import { validateLicense } from './services/workerClient';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>({
    tier: UserTier.FREE
  });

  // Check for stored license on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('smartfile_license');
    if (storedKey) {
      handleLicenseCheck(storedKey);
    }
  }, []);

  const handleLicenseCheck = async (key: string) => {
    const result = await validateLicense(key);
    if (result.valid) {
      setSession({
        tier: result.tier,
        licenseKey: key,
        token: result.token,
        expiresAt: result.expiry
      });
      localStorage.setItem('smartfile_license', key);
    } else {
      setSession({ tier: UserTier.FREE });
      localStorage.removeItem('smartfile_license');
    }
  };

  const logout = () => {
    setSession({ tier: UserTier.FREE });
    localStorage.removeItem('smartfile_license');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header session={session} onLogout={logout} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ImageTool session={session} onValidateKey={handleLicenseCheck} />} />
            <Route path="/pricing" element={<Pricing onValidateKey={handleLicenseCheck} />} />
            <Route path="/terms" element={<Legal type="terms" />} />
            <Route path="/privacy" element={<Legal type="privacy" />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Anti-Bypass Modal Trigger for Unauthenticated Premium Features */}
        <CookieBanner />
      </div>
    </Router>
  );
};

const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(!localStorage.getItem('cookie_consent'));
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-slate-200 p-4 rounded-xl shadow-2xl z-50">
      <h3 className="font-bold text-slate-800 mb-2">Privacy & Cookies</h3>
      <p className="text-sm text-slate-600 mb-4">
        We use anonymous session cookies for essential features. No personal data is tracked or shared.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => { localStorage.setItem('cookie_consent', 'true'); setShow(false); }}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Accept
        </button>
        <button 
          onClick={() => setShow(false)}
          className="flex-1 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Manage
        </button>
      </div>
    </div>
  );
};

export default App;
