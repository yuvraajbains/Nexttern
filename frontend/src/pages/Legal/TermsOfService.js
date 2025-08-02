import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import { FileText, User, Shield, AlertTriangle, Settings, Scale, Clock } from 'lucide-react';

export default function TermsOfService() {
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  const sections = [
    {
      icon: User,
      title: "Use of Service",
      items: [
        "You must be at least 16 years old to use Nexttern",
        "Do not misuse our services or attempt to access them in unauthorized ways",
        "Use the platform only for legitimate internship search and career development purposes"
      ]
    },
    {
      icon: Shield,
      title: "Account Responsibilities",
      items: [
        "You are responsible for maintaining the security of your account",
        "Notify us immediately of any unauthorized use of your account",
        "Provide accurate and complete information when creating your profile",
        "Keep your contact information up to date for important communications"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      items: [
        "Impersonating other users, companies, or organizations",
        "Posting false or misleading information about internships or companies",
        "Attempting to circumvent security measures or access restricted areas",
        "Using the platform for spam, harassment, or any illegal activities"
      ]
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      description: "Nexttern is provided 'as is' without warranties of any kind. While we strive to provide accurate internship information and maintain platform security, we are not liable for any damages resulting from your use of the service, including but not limited to missed opportunities, data loss, or technical issues."
    },
    {
      icon: Settings,
      title: "Service Availability",
      description: "We work to maintain high availability of our services, but cannot guarantee uninterrupted access. We may temporarily suspend service for maintenance, updates, or to address security issues. We will provide advance notice when possible."
    }
  ];

  const stats = [
    { label: "Account Security", value: "Protected", icon: Shield },
    { label: "Terms Compliance", value: "Required", icon: FileText },
    { label: "User Age Minimum", value: "16+", icon: User },
    { label: "Support Response", value: "24h", icon: Clock }
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
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <div className="h-1 w-24 bg-white/30 mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              By using Nexttern, you agree to these terms. Please read them carefully to understand your rights and responsibilities.
            </p>
          </div>
        </motion.section>

        {/* Stats */}
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

        {/* Main Terms Sections */}
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

        {/* Additional Legal Sections */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            {/* Intellectual Property */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All content, features, and functionality of Nexttern, including but not limited to text, graphics, logos, and software, are owned by Nexttern and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">You may not copy, modify, or distribute our content without permission</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">You retain ownership of content you submit to the platform</span>
                </li>
              </ul>
            </div>

            {/* Privacy and Data */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data Usage</h2>
              <p className="text-gray-300 leading-relaxed">
                Your use of Nexttern is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By agreeing to these Terms of Service, you also agree to the terms of our Privacy Policy.
              </p>
            </div>

            {/* Termination */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Account Termination</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Either party may terminate your access to Nexttern at any time:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">You may delete your account at any time through your account settings</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">We may suspend or terminate accounts that violate these terms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-300">Upon termination, your right to use the service ceases immediately</span>
                </li>
              </ul>
            </div>

            {/* Changes to Terms */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to These Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these Terms of Service from time to time to reflect changes in our practices, legal requirements, or service offerings. We will notify you of any material changes by email or through our platform. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
              </p>
            </div>

            {/* Governing Law */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of Nexttern will be resolved through appropriate legal channels in the jurisdiction where Nexttern operates.
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
                These Terms of Service were last updated on July 19, 2025
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}