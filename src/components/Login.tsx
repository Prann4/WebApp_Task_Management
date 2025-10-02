import React, { useState } from 'react';

interface LoginProps {
  login: (username: string, password: string, isRegister: boolean) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(username, password, isRegister);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white rounded-tr-[80px] rounded-br-[80px] p-16 items-center justify-center">
        <div className="max-w-xl w-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-black">TaskMate</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-black mb-2">
            One Place for <span className="text-cyan-500">All Your Tasks</span>
          </h2>
          
          <div className="mt-16">
            <img
              src="https://user-gen-media-assets.s3.amazonaws.com/gemini_images/7bb5621a-4019-4711-9212-0cbc9eb80c28.png"
              alt="Team collaboration illustration"
              className="w-full h-auto"
              style={{ maxWidth: '900px' }}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Welcome to TaskMate</h2>
            <p className="text-black">One Place for All Your Tasks</p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-black mb-2 font-medium">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="text-right">
              <button className="text-sm text-gray-600 hover:text-cyan-500 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                isRegister ? 'Register' : 'Login'
              )}
            </button>

            <p className="text-center text-sm text-gray-700">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-cyan-500 hover:text-cyan-600 hover:underline font-semibold transition-colors"
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-500 mt-12">
            ©2025 TaskMate. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;