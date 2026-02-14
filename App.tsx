
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileStack, Facebook, Mail, Menu, X, Info, LayoutGrid } from 'lucide-react';
import { TOOLS } from './constants';
import ToolGrid from './components/ToolGrid';
import Hero from './components/Hero';
import ToolPage from './components/ToolPage';
import HowItWorks from './components/HowItWorks';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Use a slightly longer delay to ensure the Home component and ToolGrid are mounted
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg transition-transform group-hover:scale-110">
              <FileStack className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">PDF Toolkit<span className="text-blue-600">Pro</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleScrollTo('tools')} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{t.nav.tools}</button>
            <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>{t.nav.about}</Link>
            <Link to="/contact" className={`text-sm font-medium transition-colors ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>{t.nav.contact}</Link>
            <button onClick={() => handleScrollTo('tools')} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95">
              {t.nav.getStarted}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <button onClick={() => handleScrollTo('tools')} className="block w-full text-left text-base font-medium text-gray-900 hover:text-blue-600">{t.nav.tools}</button>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-900 hover:text-blue-600">{t.nav.about}</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-900 hover:text-blue-600">{t.nav.contact}</Link>
            <button onClick={() => handleScrollTo('tools')} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold">{t.nav.getStarted}</button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const { language, setLanguage, t } = useLanguage();
  const languages: Language[] = ['English', 'Spanish', 'French', 'Tagalog'];
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollToTools = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return;
    }
    const element = document.getElementById('tools');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FileStack className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PDF Toolkit Pro</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t.footer.desc}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.nav.tools}</h4>
            <ul className="space-y-2">
              <li><button onClick={handleScrollToTools} className="text-gray-500 hover:text-blue-600 text-sm text-left">{t.hero.explore}</button></li>
              <li><Link to="/tool/word-to-pdf" className="text-gray-500 hover:text-blue-600 text-sm">Convert Word to PDF</Link></li>
              <li><Link to="/tool/pdf-to-word" className="text-gray-500 hover:text-blue-600 text-sm">Convert PDF to Word</Link></li>
              <li><Link to="/tool/merge-pdf" className="text-gray-500 hover:text-blue-600 text-sm">Merge PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-500 hover:text-blue-600 text-sm">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-blue-600 text-sm">{t.nav.contact}</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-blue-600 text-sm">{t.footer.privacy}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.footer.connect}</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/Yuwenwei05" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="mailto:byndathletics@gmail.com" className="text-gray-400 hover:text-red-500 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2024 PDF Toolkit Pro. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`hover:text-gray-900 transition-colors px-2 py-1 rounded-md ${language === lang ? 'text-blue-600 font-bold bg-blue-50' : ''}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('English');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <HowItWorks />
                  <ToolGrid />
                </>
              } />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/tool/:id" element={<ToolPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
