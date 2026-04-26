import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { TrendingUp, ShieldCheck, BarChart2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message, register, reset } = useAuthStore();

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    reset();
  }, [user, isError, isSuccess, message, navigate, reset]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    register(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-white">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6 lg:mb-10">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="text-white h-6 w-6" />
              </div>
              <span className="text-2xl font-black text-blue-600 tracking-tighter uppercase">BETA EXCHANGE</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Create account</h2>
            <p className="text-gray-500 font-medium">Start your trading journey with us today.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  placeholder="John Doe"
                  value={name}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={onChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 p-12 text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

        <div className="max-w-lg w-full relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8">
            <TrendingUp className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter uppercase">The world's best <br />trading platform.</h1>
          <p className="text-blue-100 text-lg font-medium mb-12 leading-relaxed">
            Take control of your financial future. Access global markets, advanced analytics, 
            and a community of over 2 million traders.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left">
              <ShieldCheck className="h-8 w-8 mb-4 text-blue-200" />
              <h4 className="font-bold text-xl mb-1">Reliable</h4>
              <p className="text-blue-100 text-sm font-medium">99.9% uptime and lightning fast execution.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left">
              <BarChart2 className="h-8 w-8 mb-4 text-blue-200" />
              <h4 className="font-bold text-xl mb-1">Global</h4>
              <p className="text-blue-100 text-sm font-medium">Trade stocks, crypto, and forex from one place.</p>
            </div>
          </div>
        </div>

        {/* Brand Watermark */}
        <div className="absolute bottom-10 right-10 flex items-center space-x-2 opacity-50">
          <span className="text-xl font-black tracking-tighter uppercase">Beta Exchange</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
