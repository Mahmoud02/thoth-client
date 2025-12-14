import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Sparkles, CheckCircle2, Database, Globe } from "lucide-react";
import { useState, useEffect } from "react";

const Hero = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const messages = [
        {
            question: "What does the Q3 report say?",
            answer: <span>Revenue is up <span className="font-bold text-green-600">20%</span> compared to last quarter! 📈</span>
        },
        {
            question: "Summarize the customer feedback.",
            answer: "Users love the new dark mode, but requested faster load times."
        },
        {
            question: "Draft a welcome email.",
            answer: "Welcome to Thoth! 🚀 We're excited to have you on board."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 10000); // Cycle every 10 seconds to match CSS animation loop

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-[-1]">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-8 flex justify-center">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary">
                        <Sparkles className="h-3.5 w-3.5 mr-2 fill-primary" />
                        Now available in public beta
                    </Badge>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                    Build Custom AI Agents <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        for Your Business
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Thoth lets you build, train, and deploy custom AI agents in minutes.
                    Connect your data, customize behavior, and integrate anywhere.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link to="/login">
                        <Button size="lg" className="h-12 px-8 text-lg rounded-full group shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Build Your Chatbot
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="#demo">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                            View Demo
                        </Button>
                    </Link>
                </div>

                {/* Hero Visual/Dashboard Preview */}
                <div className="relative mx-auto max-w-5xl mt-16">
                    <div className="rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden p-8 ring-1 ring-white/10">
                        <div className="rounded-lg border bg-card/50 min-h-[400px] relative overflow-hidden group">
                            {/* Abstract UI Representation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50" />

                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full p-8">

                                {/* LEFT: Central Bot & Resources */}
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="relative mb-8">
                                        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse-glow z-20 relative">
                                            <Bot className="h-16 w-16 text-white" />
                                        </div>

                                        {/* Animated Resources */}
                                        <div className="absolute -top-12 -left-20 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-ingest-tl z-10">
                                            <Database className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div className="absolute -top-12 -right-20 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-ingest-tr z-10">
                                            <Globe className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg animate-ingest-b z-10">
                                            <CheckCircle2 className="h-6 w-6 text-orange-500" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <h3 className="text-2xl font-bold">Thoth Assistant</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                            <span>Online & Ready</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Chat Interaction */}
                                <div className="flex flex-col justify-center h-full relative min-h-[300px]">
                                    {/* User Message (Right) */}
                                    <div key={`user - ${currentMessageIndex} `} className="absolute top-1/4 right-0 w-full flex justify-end animate-chat-user opacity-0">
                                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm shadow-lg max-w-[90%]">
                                            <p className="text-sm font-medium animate-typing" style={{ width: '0', animationDelay: '1s', animationFillMode: 'forwards' }}>
                                                {messages[currentMessageIndex].question}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bot Typing Indicator (Left) */}
                                    <div key={`typing-${currentMessageIndex}`} className="absolute top-1/2 left-0 flex justify-start animate-chat-bot-dots opacity-0">
                                        <div className="bg-white dark:bg-slate-800 border px-4 py-3 rounded-2xl rounded-tl-sm shadow-md flex gap-1">
                                            <div className="h-2 w-2 bg-foreground/40 rounded-full animate-dot-1"></div>
                                            <div className="h-2 w-2 bg-foreground/40 rounded-full animate-dot-2"></div>
                                            <div className="h-2 w-2 bg-foreground/40 rounded-full animate-dot-3"></div>
                                        </div>
                                    </div>

                                    {/* Bot Response (Left) */}
                                    <div key={`bot-${currentMessageIndex}`} className="absolute top-1/2 left-0 flex justify-start animate-chat-bot-message opacity-0" style={{ zIndex: 10 }}>
                                        <div className="bg-white dark:bg-slate-800 border px-4 py-3 rounded-2xl rounded-tl-sm shadow-md max-w-[90%]">
                                            <p className="text-sm text-foreground">
                                                {messages[currentMessageIndex].answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Decorative blobs behind the image */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur-3xl opacity-20 z-[-1]" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
