import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FAQGirl } from '../assets/images/index.js'

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState(2);

  const faqs = [
    {
      question: "How do I book a flight?",
      answer: "You can book a flight through our website. Simply enter your departure and destination cities, select your travel dates, choose from available flights, and complete the payment process. You'll receive a confirmation email with your booking details."
    },
    {
      question: "What information do I need to book a flight?",
      answer: "You'll need your full name (as it appears on your ID), date of birth, contact information (email and phone number), and payment details. For international flights, you'll also need your passport number and expiration date. Make sure all information matches your travel documents exactly."
    },
    {
      question: "Can I book a flight without a passport?",
      answer: "International travel requires a passport, while domestic flights usually accept government-issued photo IDs."
    },
    {
      question: "When should I book a flight to get the best deals?",
      answer: "For the best deals, book domestic flights 1-3 months in advance and international flights 2-8 months ahead. Tuesday and Wednesday are often the cheapest days to fly. Avoid booking during peak seasons and holidays. Set up price alerts and be flexible with your travel dates for maximum savings."
    }
  ];

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-100 drop-shadow-lg z-20 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Left side - Image */}
            <div className="relative flex items-end h-full">
              <img 
                src={FAQGirl} 
                alt="FAQ" 
                className="w-full scale-120 object-contain object-bottom"
              />
              <div className="absolute top-4 right-1/3 translate-x-1/2 rotate-12 text-blue-300 text-8xl font-bold opacity-50">
                ?
              </div>
            </div>

            {/* Right side - FAQ Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Common FAQs address various topics concisely, easing information retrieval for curious individuals.
              </p>

              {/* FAQ Items */}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="border-b border-gray-200 pb-4"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <span className="text-gray-800 font-medium text-base pr-4">
                        {faq.question}
                      </span>
                      {expandedIndex === index ? (
                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedIndex === index && faq.answer && (
                      <div className="mt-3 text-gray-600 text-sm pl-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}