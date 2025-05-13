
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword || !phone) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(email, password, username, phone);
      navigate('/login');
    } catch (error) {
      // Error is already handled in the signup function
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 py-12">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-gray-400">Enter your details to create your account</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="username">
              Username
            </label>
            <Input
              id="username"
              placeholder="YourGamertag"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background border-gray-700 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background border-gray-700 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="phone">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background border-gray-700 focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background border-gray-700 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background border-gray-700 focus:border-primary"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-gray-400">Already have an account?</span>{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
