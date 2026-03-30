import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What services do you offer?",
    answer: "We offer a wide range of healthcare services including pediatrics, orthopedics, cardiology, neurology, and general check-ups. Our specialists are dedicated to providing personalized care for all ages."
  },
  {
    question: "How can I book an appointment?",
    answer: "You can book an appointment directly through our website by clicking the 'Book a call' button. Alternatively, you can download our mobile app for better management of your visits."
  },
  {
    question: "Are your services available 24/7?",
    answer: "Our emergency services and virtual consultations are available 24/7. Standard clinic visits are available during regular business hours."
  },
  {
    question: "Do you accept insurance?",
    answer: "Yes, we accept most major insurance providers. Please contact our support team or check our insurance page for a specific list."
  },
  {
    question: "What makes your care unique?",
    answer: "We combine advanced AI-driven diagnostics with compassionate human care. Our 'RAHI' approach ensures you get the most accurate treatment with a personal touch."
  }
]

export function FAQSection() {
  return (
    <section className="container py-12 md:py-24 max-w-3xl border-t">
       <div className="text-center mb-12">
        <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-4">● FAQ's</h2>
        <h3 className="text-3xl md:text-5xl font-bold text-foreground">
          Frequently asked questions <br />
          for quick answers
        </h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b-0 mb-4">
            <AccordionTrigger className="text-lg md:text-xl text-left hover:no-underline py-6">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base pb-6">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
