import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/config';
import { FcGoogle } from 'react-icons/fc';

const SignInScreen: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
        Elevate Productivity
        </h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">with LockIn</h2>
        <p className="text-gray-600 mb-8">Your personal productivity sanctuary awaits. Sign in to begin your journey.</p>
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 transition duration-300 border border-gray-300 shadow-md"
        >
          <FcGoogle className="mr-4 text-2xl" />
          <span className="font-semibold">Sign In with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SignInScreen;