import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "How do I train my AI agent?",
        answer: "You can upload PDF documents, text files, or crawl your website directly. Thoth automatically processes this data to train your agent."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take security seriously. Your data is encrypted at rest and in transit. We do not use your data to train our base models."
    },
    {
        question: "Can I embed the chatbot on my website?",
        answer: "Absolutely. We provide a simple Javascript snippet that you can copy and paste into any website (WordPress, Shopify, React, etc.) to show the chat widget."
    },
    {
        question: "Which AI models do you support?",
        answer: "We support the latest models including GPT-4o, Claude 3.5 Sonnet, and Gemini Pro. You can switch between models in your agent settings."
    },
    {
        question: "Is there a free trial?",
        answer: "Yes, we offer a generous free tier that lets you build one agent and test it out. No credit card required."
    }
];

const FAQ = () => {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about Thoth.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-lg font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
