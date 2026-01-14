
import React from 'react';

interface LegalProps {
  type: 'terms' | 'privacy';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm prose prose-slate">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
        {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      </h1>
      
      {isPrivacy ? (
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Last Updated: October 2023</p>
          <section>
            <h2 className="text-xl font-bold text-slate-800">1. Data Sovereignty</h2>
            <p>Your privacy is our core architecture. Unlike other utilities, SmartFile processes all image operations locally in your browser. Your images are <strong>never</strong> uploaded to our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800">2. Cookies</h2>
            <p>We use essential cookies to manage your premium session and preferences. We do not use third-party tracking cookies for behavioral advertising.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800">3. Compliance</h2>
            <p>We are compliant with GDPR and CCPA guidelines by virtue of not collecting personal data. Anonymous usage metrics may be collected to improve tool performance.</p>
          </section>
        </div>
      ) : (
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Last Updated: October 2023</p>
          <section>
            <h2 className="text-xl font-bold text-slate-800">1. License Usage</h2>
            <p>Premium licenses are for individual use. Sharing license keys or bypassing usage limits through automated means is strictly prohibited and will result in revocation.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800">2. Limitation of Liability</h2>
            <p>The tool is provided "as-is". While we prioritize security, SmartFile is not responsible for data loss. Users should maintain original copies of all processed files.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800">3. Fair Use</h2>
            <p>Free users are limited to 1 image per operation. Premium users enjoy higher limits, subject to fair use monitoring by our backend logic.</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default Legal;
