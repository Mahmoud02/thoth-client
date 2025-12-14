import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
    return (
        <section className="py-24 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                    Ready to build your custom AI?
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Join thousands of businesses building custom AI agents with Thoth.
                    Start for free, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login">
                        <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="#demo">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full bg-background">
                            Contact Sales
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTA;
