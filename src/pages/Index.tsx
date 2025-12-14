import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import TrustedBy from "@/components/Landing/TrustedBy";
import Features from "@/components/Landing/Features";
import HowItWorks from "@/components/Landing/HowItWorks";
import FAQ from "@/components/Landing/FAQ";
import CTA from "@/components/Landing/CTA";
import Footer from "@/components/Landing/Footer";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/20">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
