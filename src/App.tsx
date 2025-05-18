import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Upload,
  DollarSign,
  CreditCard,
  Shield,
  Tag,
  Clock,
  Users,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const colorThemes = {
  light: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-teal-500 hover:bg-teal-600',
    accent: 'bg-amber-500 hover:bg-amber-600',
    heroBackground: 'bg-gradient-to-r from-indigo-50 to-blue-50',
    background: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    card: 'bg-white',
    sectionAlt: 'bg-gray-50',
    footer: 'bg-gray-100',
    modalBg: 'bg-white',
    modalText: 'text-gray-800',
    borderColor: 'border-gray-200'
  },
  dark: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-teal-600 hover:bg-teal-700',
    accent: 'bg-amber-500 hover:bg-amber-600',
    heroBackground: 'bg-gradient-to-r from-gray-800 to-indigo-950',
    background: 'bg-gray-900',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    card: 'bg-gray-800',
    sectionAlt: 'bg-gray-850',
    footer: 'bg-gray-850',
    modalBg: 'bg-gray-800',
    modalText: 'text-gray-100',
    borderColor: 'border-gray-700'
  }
};
const predefinedQuestions = [
  "How does the license valuation process work?",
  "What types of software licenses do you accept?",
  "How long does it take to get paid?",
  "Is my data secure when I sell my license?",
  "What payment methods do you support?"
];

// System prompt for Gemini to act as a SoftSell assistant
const SYSTEM_PROMPT = `You are SoftSell's AI Assistant. Your role is to help users understand the software license selling process.
Key responsibilities:
- Provide clear, professional information about license selling
- Explain SoftSell's valuation process and security measures
- Answer questions about payment methods and timelines
- Stay focused on software license related topics
- Be concise but helpful
- If unsure, direct users to contact support at support@softsell.com

Remember: Maintain a professional, knowledgeable tone and focus on software license trading topics.`;

// Replace simulated response with actual Gemini API call
const getGeminiResponse = async (question: string): Promise<string> => {
  const apiKey = API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nUser: ${question}\nAssistant:`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    throw new Error('Invalid response from Gemini API');
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I apologize, but I'm having trouble connecting to the service. Please try again or contact our support team.";
  }
};

// Chatbot Component
const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hi there! How can I help you with selling your software licenses today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const theme = localStorage.getItem('theme') === 'dark' ? colorThemes.dark : colorThemes.light;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuestions(false);

    try {
      const response = await getGeminiResponse(input);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Sorry, I encountered an error. Please try again or contact our support team.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setShowQuestions(false);

    try {
      const response = await getGeminiResponse(question);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Sorry, I encountered an error. Please try again or contact our support team.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed bottom-20 right-6 w-80 sm:w-96 shadow-xl rounded-lg overflow-hidden z-50 flex flex-col ${theme.modalBg} ${theme.borderColor} border`}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{ maxHeight: '70vh' }}
        >
          {/* Chatbot header */}
          <div className={`p-4 ${theme.primary} flex justify-between items-center`}>
            <h4 className="font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} />
              SoftSell Assistant
            </h4>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '300px' }}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? `${theme.primary} text-white ml-6` 
                    : `${theme.card} ${theme.borderColor} border mr-6`
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.content}
              </motion.div>
            ))}
            {isLoading && (
              <div className={`p-3 rounded-lg ${theme.card} ${theme.borderColor} border mr-6`}>
                <div className="flex gap-2">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Suggested questions */}
          {showQuestions && messages.length < 2 && (
            <div className={`p-4 ${theme.sectionAlt} border-t ${theme.borderColor}`}>
              <p className="text-sm font-medium mb-2 text-gray-500">Suggested questions:</p>
              <div className="space-y-2">
                {predefinedQuestions.map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuestionClick(q)}
                    className={`text-sm p-2 rounded text-left w-full ${theme.borderColor} border hover:${theme.secondary} hover:text-white transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className={`p-3 flex gap-2 border-t ${theme.borderColor}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className={`flex-1 p-2 rounded border ${theme.borderColor} ${theme.modalBg} ${theme.modalText} text-sm`}
            />
            <button 
              type="submit" 
              className={`${theme.primary} p-2 rounded text-white`}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FaqItem: React.FC<{question: string, answer: string}> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = localStorage.getItem('theme') === 'dark' ? colorThemes.dark : colorThemes.light;
  
  return (
    <div className={`border ${theme.borderColor} rounded-lg overflow-hidden mb-4`}>
      <button 
        className={`w-full p-4 text-left flex justify-between items-center ${theme.card} ${theme.textPrimary}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              type: "tween", 
              duration: 0.2, 
              ease: "easeOut" 
            }}
            className={`overflow-hidden ${theme.sectionAlt} ${theme.textSecondary} border-t ${theme.borderColor}`}
          >
            <div className="p-4">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main App Component
export default function App(): JSX.Element {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    licenseType: '',
    message: ''
  });
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  const theme = darkMode ? colorThemes.dark : colorThemes.light;

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Your inquiry has been submitted! We'll get back to you soon.");
    setFormData({
      name: '',
      email: '',
      company: '',
      licenseType: '',
      message: ''
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.background} ${theme.textPrimary}`}>
      {/* Header */}
      <header className={`p-4 md:p-6 shadow-md sticky top-0 z-10 ${theme.background}`}>
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600`}>
              SoftSell
            </span>
          </motion.h1>
          
          <div className="flex gap-2 md:gap-4 items-center">
            <motion.button 
              className={`px-3 py-1.5 md:px-4 md:py-2 ${theme.primary} text-white rounded-full flex items-center gap-1 text-sm md:text-base`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: document.getElementById('contact-form')?.offsetTop, behavior: 'smooth' })}
            >
              <span className="hidden md:inline">Get a Quote</span>
              <span className="md:hidden">Quote</span>
            </motion.button>
            
            <motion.button 
              className={`p-2 rounded-full ${theme.sectionAlt}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            
            <motion.button 
              className={`p-2 rounded-full ${isChatbotOpen ? theme.secondary : theme.sectionAlt}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
              aria-label="Open chat assistant"
            >
              <MessageSquare size={18} className={isChatbotOpen ? "text-white" : ""} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`py-16 md:py-24 px-4 ${theme.heroBackground}`}>
        <div className="container mx-auto">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Resell Your Software <span className="text-indigo-500">Licenses</span> Easily
            </h2>
            <p className="text-lg mb-8 max-w-lg mx-auto">Turn your unused software into cash in just a few clicks. Simple, secure, and profitable.</p>
            <motion.button 
              className={`px-6 py-3 ${theme.primary} text-white rounded-full text-lg shadow-lg`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sell My Licenses
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Upload License',
                desc: 'Provide your software license details through our secure portal.',
                icon: <Upload size={36} className="text-indigo-500" />,
              },
              {
                title: 'Get Valuation',
                desc: 'Receive an instant and fair market-based valuation.',
                icon: <DollarSign size={36} className="text-indigo-500" />,
              },
              {
                title: 'Get Paid',
                desc: 'Receive payment quickly through your preferred method.',
                icon: <CreditCard size={36} className="text-indigo-500" />,
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                className={`${theme.card} p-6 rounded-xl shadow-sm text-center border ${theme.borderColor}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className={theme.textSecondary}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={`${theme.sectionAlt} py-16 px-4`}>
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold mb-12 text-center">Why Choose Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Secure Process',
                desc: 'End-to-end encryption for your data.',
                icon: <Shield size={28} className="text-indigo-500" />,
              },
              {
                title: 'Fair Pricing',
                desc: 'We offer market competitive quotes.',
                icon: <Tag size={28} className="text-indigo-500" />,
              },
              {
                title: 'Fast Payments',
                desc: 'Get paid within 24 hours.',
                icon: <Clock size={28} className="text-indigo-500" />,
              },
              {
                title: 'Expert Support',
                desc: 'Our team is here to help you 24/7.',
                icon: <Users size={28} className="text-indigo-500" />,
              },
            ].map((item, i) => (
              <motion.div 
                key={i}
                className={`${theme.card} p-4 rounded-lg border ${theme.borderColor} flex flex-col items-center text-center`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="mb-3">
                  {item.icon}
                </div>
                <h4 className="font-bold text-base md:text-lg">{item.title}</h4>
                <p className={`text-sm ${theme.textSecondary}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl md:text-3xl font-semibold mb-12 text-center">What Our Clients Say</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                text: 'SoftSell helped me monetize unused licenses hassle-free. The process was transparent and the valuation exceeded my expectations.',
                author: 'Sarah T., IT Manager, ByteCorp',
                rating: 5,
              },
              {
                text: 'Quick and easy platform. Got payment within a day. Their support team was particularly helpful when I had questions about the process.',
                author: 'James R., Procurement Lead, AppWorld',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div 
                key={i} 
                className={`${theme.card} p-6 rounded-xl shadow-sm border ${theme.borderColor}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className={`italic mb-4 ${theme.textSecondary}`}>"{testimonial.text}"</p>
                <p className={`font-semibold text-sm ${theme.textPrimary}`}>- {testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`${theme.sectionAlt} py-16 px-4`}>
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <FaqItem 
              question="What types of software licenses can I sell?" 
              answer="You can sell almost any commercial software license, including operating systems, design software, security solutions, office suites, and development tools. Our platform currently supports over 500 software vendors."
            />
            <FaqItem 
              question="How is the value of my license determined?" 
              answer="We use current market data, remaining validity period, software type, version, and demand to determine a fair value for your license. Our algorithm is continuously updated to reflect current market conditions."
            />
            <FaqItem 
              question="How long does the process take?" 
              answer="The entire process typically takes 1-2 business days. License verification usually completes within hours, and payment is processed within 24 hours after verification."
            />
            <FaqItem 
              question="Is my data secure when I sell my license?" 
              answer="Absolutely. We use bank-grade encryption for all data transmission and storage. Your privacy and security are our top priorities, and we never share your information with third parties without your explicit consent."
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className={`py-16 px-4 ${theme.heroBackground}`}>
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Get a Free Quote</h3>
          <form 
            className="max-w-xl mx-auto space-y-4" 
            onSubmit={handleFormSubmit}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Name" 
                required 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.card} ${theme.textPrimary}`} 
              />
              <input 
                type="email" 
                placeholder="Email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.card} ${theme.textPrimary}`} 
              />
            </div>
            <input 
              type="text" 
              placeholder="Company" 
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.card} ${theme.textPrimary}`} 
            />
            <select 
              required 
              value={formData.licenseType}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseType: e.target.value }))}
              className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.card} ${theme.textPrimary}`}
            >
              <option value="">Select License Type</option>
              <option>Antivirus / Security</option>
              <option>Operating System</option>
              <option>Design / Creative Software</option>
              <option>Development Tools</option>
              <option>Office Suite</option>
              <option>Business Software</option>
              <option>Other</option>
            </select>
            <textarea 
              placeholder="Tell us about your license" 
              rows={4} 
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className={`w-full p-3 rounded-lg border ${theme.borderColor} ${theme.card} ${theme.textPrimary}`}
            ></textarea>
            <motion.button 
              type="submit" 
              className={`px-6 py-3 ${theme.primary} text-white rounded-lg w-full md:w-auto`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get My Quote
            </motion.button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className={`p-6 ${theme.footer}`}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">SoftSell</h4>
              <p className={`text-sm ${theme.textSecondary}`}>
                The leading marketplace for software license reselling.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
                <li><a href="#" className="hover:underline">How It Works</a></li>
                <li><a href="#" className="hover:underline">Sell License</a></li>
                <li><a href="#" className="hover:underline">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
                <li><a href="#" className="hover:underline">FAQ</a></li>
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t text-center text-sm">
            <p>&copy; 2025 SoftSell. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      
      {/* Chat Button (visible when chatbot is closed) */}
      {!isChatbotOpen && (
        <motion.button
          className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg ${theme.primary} text-white flex items-center gap-2`}
          onClick={() => setIsChatbotOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageSquare size={20} />
          <span className="hidden sm:inline">Chat with us</span>
        </motion.button>
      )}
    </div>
  );
}