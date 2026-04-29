import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export function TermsPage() {
  const { user, signOut } = useAuth();

  return (
    <Layout>
      <div className="bg-[#0a0a0b] min-h-screen">
        <div className="max-w-4xl mx-auto p-6 pb-24">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Terms of Service</h1>
            <p className="text-emerald-500 font-bold text-sm uppercase tracking-widest">Last Updated: April 9, 2026</p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                By accessing and using findejob.com ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to modify these terms at any time, and your continued use of the Platform constitutes acceptance of those changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. User Eligibility</h2>
              <p className="text-gray-400 leading-relaxed">
                You must be at least 13 years of age to use this Platform. If you are under 18, you must have permission from a parent or legal guardian. By creating an account, you represent and warrant that you meet these eligibility requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Account Responsibility</h2>
              <p className="text-gray-400 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Earning and Rewards</h2>
              <p className="text-gray-400 leading-relaxed">
                The Platform allows users to earn virtual "coins" by completing various tasks, including but not limited to surveys, offers, and games. These coins have no real-world value until they are redeemed through our approved payout methods. We reserve the right to adjust coin values, payout minimums, and available redemption options at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Prohibited Conduct</h2>
              <p className="text-gray-400 leading-relaxed">
                Users are strictly prohibited from using VPNs, proxies, or any other tools to manipulate their location or identity. Creating multiple accounts, using automated scripts, or attempting to defraud the Platform or its partners will result in immediate account termination and forfeiture of all earnings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">6. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                The Platform is provided "as is" without any warranties. We do not guarantee that the Platform will be error-free or uninterrupted. In no event shall findejob.com be liable for any indirect, incidental, or consequential damages arising out of your use of the Platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
