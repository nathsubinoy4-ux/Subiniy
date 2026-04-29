import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '../components/Auth/SignUpForm';

export function SignUpPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#111116] flex flex-col items-center justify-center p-4 selection:bg-brand-500 selection:text-zinc-950">
      <SignUpForm onClose={() => navigate('/')} />
    </div>
  );
}
