import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Command, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { login, isLoading } = useAuth();

  const messages = [
    {
      question: "How can I deploy my agent?",
      answer: <span>It's easy! Just go to the <span className="text-primary font-medium">Deploy</span> tab and copy the embed code. 🚀</span>
    },
    {
      question: "Can I customize the colors?",
      answer: "Yes! You can match your brand in the Settings > Appearance tab. 🎨"
    },
    {
      question: "Where are the chat logs?",
      answer: "All conversations are stored in the 'Inbox' section for your review. 📝"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const demoAccounts = [
    { email: 'superadmin@example.com', role: 'Super Admin' },
    { email: 'admin@example.com', role: 'Admin' },
    { email: 'user@example.com', role: 'User' },
  ];

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

      {/* Left Column: Login Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In with Email
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with demo account
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password');
                  }}
                  className="justify-between"
                >
                  {account.role}
                  {email === account.email && <Check className="h-4 w-4 text-green-500" />}
                </Button>
              ))}
            </div>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Column: Chat Interface Visual */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-l lg:flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900" />

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-md">
          <div className="w-full bg-zinc-800/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Thoth Assistant</h3>
                <p className="text-xs text-zinc-400">Always active</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 min-h-[300px] relative">
              {/* User Message */}
              <div key={`user-${currentMessageIndex}`} className="flex justify-end animate-chat-user opacity-0" style={{ animationDelay: '0.5s' }}>
                <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg max-w-[85%]">
                  <p className="text-sm">{messages[currentMessageIndex].question}</p>
                </div>
              </div>

              {/* Bot Typing */}
              <div key={`typing-${currentMessageIndex}`} className="flex justify-start animate-chat-bot-dots opacity-0">
                <div className="bg-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md flex gap-1">
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-dot-1"></div>
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-dot-2"></div>
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-dot-3"></div>
                </div>
              </div>

              {/* Bot Response */}
              <div key={`bot-${currentMessageIndex}`} className="flex justify-start animate-chat-bot-message opacity-0">
                <div className="bg-zinc-700/50 text-zinc-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md max-w-[90%]">
                  <p className="text-sm">
                    {messages[currentMessageIndex].answer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Chat with your data</h2>
            <p className="text-zinc-400">
              Build, train, and deploy custom AI agents in minutes.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginForm;
