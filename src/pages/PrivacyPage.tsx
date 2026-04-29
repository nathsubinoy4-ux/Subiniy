import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export function PrivacyPage() {
  const { user, signOut } = useAuth();

  return (
    <Layout>
      <div className="bg-[#0a0a0b] min-h-screen">
        <div className="max-w-4xl mx-auto p-6 pb-24">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Privacy Policy</h1>
            <p className="text-emerald-500 font-bold text-sm uppercase tracking-widest">Last Updated: April 9, 2026</p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Information We Collect</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We collect information that you provide directly to us when you create an account, update your profile, or interact with our services. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Email address and account credentials</li>
                <li>Username and profile picture</li>
                <li>Device information and IP address</li>
                <li>Transaction history and earning data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. How We Use Your Information</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We use the collected information for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Providing and maintaining our services</li>
                <li>Processing rewards and payouts</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Communicating with you about updates and offers</li>
                <li>Improving the Platform's performance and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Data Sharing and Disclosure</h2>
              <p className="text-gray-400 leading-relaxed">
                We do not sell your personal information to third parties. We may share data with our trusted partners (such as offerwall providers) only to the extent necessary for them to provide their services (e.g., verifying task completion). We may also disclose information if required by law or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Data Security</h2>
              <p className="text-gray-400 leading-relaxed">
                We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Cookies and Tracking</h2>
              <p className="text-gray-400 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">6. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal data, including the right to access, correct, or delete your information. To exercise these rights, please contact our support team.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
