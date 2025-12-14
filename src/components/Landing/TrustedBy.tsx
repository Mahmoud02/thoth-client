import { Building2, Command, Cpu, Globe2, Zap } from "lucide-react";

const companies = [
    { name: "Acme Corp", icon: Building2 },
    { name: "GlobalTech", icon: Globe2 },
    { name: "NextGen", icon: Cpu },
    { name: "FastScale", icon: Zap },
    { name: "CommandAI", icon: Command },
];

const TrustedBy = () => {
    return (
        <section className="py-12 border-y bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY INNOVATIVE TEAMS
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {companies.map((company, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                            <company.icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                            <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
