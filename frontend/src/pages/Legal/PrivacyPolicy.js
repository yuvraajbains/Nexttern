import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import { Shield, Database, Settings, Lock, Users, FileText, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      items: [
        "Personal information you provide (name, email, profile details)",
        "Usage data and analytics to improve our platform",
        "Cookies and similar technologies for enhanced experience",
        "Application data to help track your internship journey"
      ]
    },
    {
      icon: Settings,
      title: "How We Use Your Information",
      items: [
        "To provide and continuously improve our services",
        "To communicate with you about opportunities and updates",
        "To personalize your internship search experience",
        "To ensure platform security and prevent fraud",
        "To match you with relevant internship opportunities"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      description: "We use industry-standard security measures including encryption, secure servers, and regular security audits to protect your data. While we implement robust security protocols, no method of transmission over the Internet is 100% secure, and we continuously work to enhance our security measures."
    },
    {
      icon: Users,
      title: "Your Rights",
      items: [
        "Access, update, or delete your personal information",
        "Opt out of marketing communications at any time",
        "Request data portability and download your data",
        "Contact us for any privacy concerns or questions"
      ]
    }
  ];

  const stats = [
    { label: "Data Encryption", value: "256-bit", icon: Shield },
    { label: "Compliance", value: "GDPR", icon: FileText },
    { label: "Security Audits", value: "Monthly", icon: Eye },
    { label: "Data Protection", value: "24/7", icon: Lock }
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
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <div className="h-1 w-24 bg-white/30 mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Your privacy is fundamental to our mission. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>
        </motion.section>

        {/* Security Stats */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10 text-center"
                >
                  <stat.icon className="w-6 h-6 text-white mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Main Content */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10"
              >
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-white/10 rounded-lg mr-4">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
                
                {section.description && (
                  <p className="text-gray-300 text-base leading-relaxed">
                    {section.description}
                  </p>
                )}
                
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                        <span className="text-gray-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Sections */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            {/* Data Sharing */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Third Parties</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">With your explicit consent</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">To comply with legal obligations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">With trusted service providers who assist in our operations</span>
                </li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will remove your personal information from our active systems within 30 days, though some information may remain in backup systems for security purposes.
              </p>
            </div>

            {/* Updates to Policy */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by email or through our platform. Your continued use of our services after such modifications constitutes acceptance of the updated policy.
              </p>
            </div>
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
                <strong>Effective Date:</strong> July 19, 2025
              </p>
              <p className="text-gray-400 text-sm">
                This Privacy Policy was last updated on July 19, 2025
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}