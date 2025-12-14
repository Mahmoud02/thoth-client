import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, MessageSquare, Loader2, User } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const AssistantChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await apiClient.queryAction(userMessage.content);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: response.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast({
                title: "Error",
                description: "Failed to process your request. Please try again.",
                variant: "destructive"
            });

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: "I'm sorry, I encountered an error processing your request.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
            {isOpen && (
                <Card className="w-[350px] md:w-[400px] h-[500px] shadow-xl border-blue-100 animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">Thoth Assistant</CardTitle>
                                <p className="text-xs text-blue-100 font-normal">Ask me to manage your files</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                            onClick={toggleChat}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col min-h-0 bg-white">
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 space-y-3">
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                            <Bot className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">How can I help you?</p>
                                            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                                                Try "Create a bucket called finance" or "List all namespaces"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${message.type === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                                                }`}
                                        >
                                            {(() => {
                                                try {
                                                    // Try to parse as JSON if it looks like JSON
                                                    if (typeof message.content === 'string' && (message.content.startsWith('[') || message.content.startsWith('{'))) {
                                                        const parsed = JSON.parse(message.content);

                                                        // Handle Array
                                                        if (Array.isArray(parsed) && parsed.length > 0) {
                                                            return (
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-xs text-left">
                                                                        <thead className="text-xs uppercase bg-slate-200/50 text-slate-600">
                                                                            <tr>
                                                                                {Object.keys(parsed[0]).map((key) => (
                                                                                    <th key={key} className="px-2 py-1 font-medium">{key}</th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {parsed.map((item: any, i: number) => (
                                                                                <tr key={i} className="border-b border-slate-200/50 last:border-0">
                                                                                    {Object.values(item).map((val: any, j: number) => (
                                                                                        <td key={j} className="px-2 py-1">
                                                                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                                        </td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            );
                                                        }

                                                        // Handle Single Object
                                                        if (typeof parsed === 'object' && parsed !== null) {
                                                            return (
                                                                <div className="space-y-1">
                                                                    {Object.entries(parsed).map(([key, value]) => (
                                                                        <div key={key} className="flex text-xs">
                                                                            <span className="font-semibold min-w-[60px] text-slate-600">{key}:</span>
                                                                            <span className="ml-2">
                                                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                } catch (e) {
                                                    // Not JSON or failed to parse, fall through to default
                                                }

                                                return message.content;
                                            })()}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center space-x-2 border border-slate-200">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            <span className="text-xs text-slate-500">Processing...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-3 border-t bg-slate-50">
                            <div className="flex items-center space-x-2 bg-white rounded-full border border-slate-200 px-1 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a command..."
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9 px-3 text-sm"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    className={`h-8 w-8 rounded-full shrink-0 transition-all ${inputValue.trim()
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                        }`}
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={toggleChat}
                size="lg"
                className={`rounded-full h-14 w-14 shadow-lg transition-all duration-300 hover:scale-105 ${isOpen
                    ? 'bg-slate-800 hover:bg-slate-900 text-white rotate-90 scale-0 opacity-0 absolute'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
            >
                <MessageSquare className="w-7 h-7" />
            </Button>

            {/* Close button that appears when chat is open (replacing the main button) */}
            {isOpen && (
                <Button
                    onClick={toggleChat}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg bg-slate-800 hover:bg-slate-900 text-white transition-all duration-300 hover:scale-105"
                >
                    <X className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
};

export default AssistantChatbot;
