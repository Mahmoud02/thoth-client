import { Database, Zap, Lock, Globe, BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        icon: Database,
        title: "Custom Data Sources",
        description: "Train your AI on your own data. Upload PDFs, connect to websites, or integrate with your database.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Zap,
        title: "Instant Deployment",
        description: "Get your chatbot up and running in minutes. Embed it on your site with a simple script tag.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
    {
        icon: Lock,
        title: "Secure & Private",
        description: "Your data is encrypted and secure. We prioritize privacy and ensure your data stays yours.",
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        icon: Globe,
        title: "Multilingual Support",
        description: "Automatically detect and respond in over 90 languages. Reach customers globally.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Gain insights into user interactions. Track sentiment, common queries, and engagement metrics.",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
    },
    {
        icon: MessageSquare,
        title: "Human Handoff",
        description: "Seamlessly escalate complex queries to human support agents when needed.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything you need to build powerful AI agents
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Thoth provides all the tools necessary to create, manage, and optimize your custom AI chatbots.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur-sm">
                            <CardHeader>
                                <div className={`h-12 w-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
