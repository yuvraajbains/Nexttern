import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import { HelpCircle, ChevronDown, ChevronUp, DollarSign, Shield, MessageCircle } from 'lucide-react';

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories = [
    {
      title: "General Questions",
      icon: HelpCircle,
      faqs: [
        {
          question: "What is Nexttern?",
          answer: "Nexttern is an AI-powered internship tracking and project generation platform designed specifically for students. We help you discover, apply to, and manage internship opportunities while providing personalized project suggestions to enhance your skills and portfolio."
        },
        {
          question: "Who can use Nexttern?",
          answer: "Nexttern is designed for students at all levels - from high school to graduate school - who are looking for internship opportunities. Whether you're seeking your first internship or looking to advance your career, our platform adapts to your experience level and goals."
        },
        {
          question: "How does the AI project generation work?",
          answer: "Our AI analyzes your profile, skills, interests, and career goals to generate personalized project ideas that align with your target internships. These projects help you build relevant experience and stand out to potential employers."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      icon: DollarSign,
      faqs: [
        {
          question: "Is Nexttern free to use?",
          answer: "Yes! Nexttern offers a comprehensive free tier that includes access to our internship database, basic tracking features, and AI-generated project suggestions. Premium features are available for users who want advanced analytics and priority support."
        },
        {
          question: "What's included in the premium plan? (COMING SOON!)",
          answer: "Premium users get unlimited AI project generations, advanced application tracking, personalized career insights, priority customer support, and early access to new features. We also provide detailed analytics on your application success rates."
        },
        {
          question: "Can I cancel my subscription anytime? (COMING SOON!)",
          answer: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time from your account settings. There are no long-term commitments or cancellation fees."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      faqs: [
        {
          question: "How is my data protected?",
          answer: "We use industry-standard encryption, secure cloud infrastructure, and strict access controls to protect your data. All information is encrypted in transit and at rest. We never sell your personal information to third parties."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you have full control over your data. You can delete your account at any time from your settings page, and we'll remove all your personal information from our active systems within 30 days."
        },

      ]
    },
    {
      title: "Support & Contact",
      icon: MessageCircle,
      faqs: [
        {
          question: "How do I contact support?",
          answer: "You can reach our support team by emailing support@nexttern.com. We typically respond within 24 hours during business days. Premium users receive priority support with faster response times."
        },

      ]
    }
  ];



  return (
    <PageLayout>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
      </div>

      <div className="relative min-h-screen">
        {/* Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-20 pb-16"
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <div className="h-1 w-24 bg-white/30 mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Find answers to common questions about Nexttern. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </motion.section>



        {/* FAQ Categories */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto px-4">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + categoryIndex * 0.1, duration: 0.5 }}
                className="mb-8"
              >
                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center">
                      <div className="p-2 bg-white/10 rounded-lg mr-4">
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                      <div className="ml-auto text-sm text-gray-400">
                        {category.faqs.length} questions
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/10">
                    {category.faqs.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 10 + faqIndex; // Unique index across all categories
                      const isOpen = openItems.has(globalIndex);
                      
                      return (
                        <motion.div
                          key={faqIndex}
                          initial={false}
                          className="border-white/10"
                        >
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between group"
                          >
                            <h3 className="text-lg font-semibold text-white group-hover:text-gray-100 pr-4">
                              {faq.question}
                            </h3>
                            <div className="flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                              )}
                            </div>
                          </button>
                          
                          <motion.div
                            initial={false}
                            animate={{
                              height: isOpen ? 'auto' : 0,
                              opacity: isOpen ? 1 : 0
                            }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut"
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4">
                              <p className="text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>


        {/* Footer */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="pb-20"
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">
                <strong>Last Updated:</strong> July 19, 2025
              </p>
              <p className="text-gray-400 text-sm">
                This FAQ was last updated on July 19, 2025
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}