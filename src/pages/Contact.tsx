import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Linkedin, Globe, MessageSquare } from 'lucide-react';

export default function Contact() {
  useEffect(() => {
    document.title = "Contact | Nafees Mansoor";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with Dr. Nafees Mansoor for research collaborations, academic inquiries, or professional consultations.');
    }
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Name: Nafees Mansoor',
      value: 'wallet@nafees.info',
      href: 'mailto:wallet@nafees.info',
      description: 'Primary email for all professional and academic inquiries.'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+880 1819242323',
      href: 'tel:+8801819242323',
      description: 'Direct contact for urgent consultations.'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Flat # i, Building # 7, Aziz Housing Society, Shahbagh, Dhaka 1000, Bangladesh',
      href: 'https://maps.google.com/?q=Aziz+Housing+Society+Shahbagh+Dhaka',
      description: 'Mailing address for physical documents and correspondence.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-16"
      >
        {/* Header */}
        <div className="space-y-6 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Contact & Professional Inquiries</h1>
          <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
            <p>
              Dr. Nafees Mansoor is an academic, consultant, and independent author based in Dhaka, Bangladesh. His work spans artificial intelligence, blockchain systems, digital transformation, and technology-driven education.
            </p>
            <p>
              He provides consulting and advisory services to academic institutions, organizations, and industry partners, focusing on applied research, system design, and innovation strategy. In addition to his academic and consulting work, he is an indie author, producing educational and thought leadership content in emerging technology domains.
            </p>
            <p className="text-indigo-400 font-medium">
              For professional inquiries, collaborations, or consulting engagements, please use the contact information below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  target={item.icon === MapPin ? "_blank" : undefined}
                  rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl flex items-start space-x-6 hover:bg-zinc-900 hover:border-white/10 transition-all group"
                >
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <item.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</h3>
                    <p className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">{item.value}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Additional Content */}
            <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl space-y-6">
              <div className="flex items-center space-x-3 text-indigo-400">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-xl font-bold">Collaborations & Inquiries</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                I am always open to discussing new projects, creative ideas, or opportunities to be part of your visions. My research interests span across Wireless Communications, Blockchain, and Distributed Computing. If you are a student looking for supervision or a researcher seeking collaboration, please feel free to reach out.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.linkedin.com/in/nafeesmansoor/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
                <a href="https://scholar.google.com/citations?user=5dt40PYAAAAJ" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Globe className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Send a Message</h2>
              <p className="text-gray-500">Fill out the form below and I'll get back to you as soon as possible.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 text-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 text-white transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Subject</label>
                <input 
                  type="text" 
                  placeholder="Research Collaboration"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 text-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Message</label>
                <textarea 
                  rows={6}
                  placeholder="Your message here..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 text-white transition-colors resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Send Message</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
