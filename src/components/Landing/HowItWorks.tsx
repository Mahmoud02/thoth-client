import { Upload, Settings, Code, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
    {
        icon: Upload,
        step: "01",
        title: "Upload your data",
        description: "Connect your data sources. Upload documents, crawl your website, or connect to your Notion/Google Drive.",
        color: "bg-blue-500/10 text-blue-500"
    },
    {
        icon: Settings,
        step: "02",
        title: "Customize behavior",
        description: "Give your AI a personality. Set instructions, choose the model (GPT-4, Claude, etc.), and tweak settings.",
        color: "bg-purple-500/10 text-purple-500"
    },
    {
        icon: Code,
        step: "03",
        title: "Embed on your site",
        description: "Copy and paste a simple code snippet to add the chatbot widget to your website instantly.",
        color: "bg-green-500/10 text-green-500"
    },
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 relative overflow-hidden bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        How it works
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Go from zero to deployed AI agent in three simple steps.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/20 to-muted z-[-1]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 animate-shimmer" />
                    </div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <Card className="relative border-none shadow-lg bg-background/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-1 ${step.color.replace('text', 'bg').replace('/10', '')}`} />

                                <CardHeader className="flex flex-col items-center pb-4 pt-8">
                                    <div className="relative">
                                        <div className={`h-24 w-24 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            <step.icon className="h-10 w-10" />
                                        </div>
                                        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background border shadow-sm flex items-center justify-center font-bold text-xs text-muted-foreground">
                                            {step.step}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center px-6 pb-8">
                                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                </CardContent>
                            </Card>

                            {/* Mobile Arrow */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden flex justify-center my-4">
                                    <ArrowRight className="text-muted-foreground/50 h-6 w-6 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
