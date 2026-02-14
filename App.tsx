
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileStack, Facebook, Mail, Menu, X, ChevronUp } from 'lucide-react';
import ToolGrid from './components/ToolGrid';
import Hero from './components/Hero';
import ToolPage from './components/ToolPage';
import HowItWorks from './components/HowItWorks';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdBanner from './components/AdBanner';
import SidebarAd from './components/SidebarAd';
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

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-[150] p-4 bg-blue-600 text-white rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
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
    <nav className={`sticky top-0 z-[200] w-full transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 py-1' : 'bg-white border-b border-gray-50 py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg transition-transform group-hover:scale-110 shadow-lg shadow-blue-200">
              <FileStack className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">PDF Toolkit<span className="text-blue-600">Pro</span></span>
          </Link>

          {/* Navigation links (Tools, About, Contact, Get Started) */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleScrollTo('tools')} 
              className="text-sm font-black text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {t.nav.tools}
            </button>
            <Link 
              to="/about" 
              className={`text-sm font-black transition-colors uppercase tracking-widest ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {t.nav.about}
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-black transition-colors uppercase tracking-widest ${location.pathname === '/contact' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {t.nav.contact}
            </Link>
            <button 
              onClick={() => handleScrollTo('tools')} 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              {t.nav.getStarted}
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-8 space-y-6">
            <button onClick={() => handleScrollTo('tools')} className="block w-full text-left text-lg font-black text-gray-900 hover:text-blue-600 uppercase tracking-widest">{t.nav.tools}</button>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block text-lg font-black text-gray-900 hover:text-blue-600 uppercase tracking-widest">{t.nav.about}</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-lg font-black text-gray-900 hover:text-blue-600 uppercase tracking-widest">{t.nav.contact}</Link>
            <button onClick={() => handleScrollTo('tools')} className="w-full bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 uppercase tracking-widest">{t.nav.getStarted}</button>
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
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FileStack className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PDF Toolkit Pro</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {t.footer.desc}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">{t.nav.tools}</h4>
            <ul className="space-y-3">
              <li><button onClick={handleScrollToTools} className="text-gray-500 font-medium hover:text-blue-600 text-sm text-left">{t.hero.explore}</button></li>
              <li><Link to="/tool/word-to-pdf" className="text-gray-500 font-medium hover:text-blue-600 text-sm">Convert Word to PDF</Link></li>
              <li><Link to="/tool/pdf-to-word" className="text-gray-500 font-medium hover:text-blue-600 text-sm">Convert PDF to Word</Link></li>
              <li><Link to="/tool/merge-pdf" className="text-gray-500 font-medium hover:text-blue-600 text-sm">Merge PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">{t.footer.company}</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-500 font-medium hover:text-blue-600 text-sm">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="text-gray-500 font-medium hover:text-blue-600 text-sm">{t.nav.contact}</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 font-medium hover:text-blue-600 text-sm">{t.footer.privacy}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">{t.footer.connect}</h4>
            <div className="flex space-x-5">
              <a href="https://www.facebook.com/Yuwenwei05" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-all transform hover:scale-110">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="mailto:byndathletics@gmail.com" className="text-gray-400 hover:text-red-500 transition-all transform hover:scale-110">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-widest">
          <p>&copy; 2024 PDF Toolkit Pro. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`hover:text-gray-900 transition-colors px-3 py-1.5 rounded-full ${language === lang ? 'text-blue-600 font-black bg-blue-50 border border-blue-100' : 'border border-transparent'}`}
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
        <div className="min-h-screen flex flex-col relative bg-white">
          <Navbar />
          
          <div className="flex-grow flex flex-col items-center">
            <div className="flex flex-row w-full max-w-[1600px] justify-center px-4 xl:px-8 relative">
              {/* Vertical Ads Left */}
              <div className="hidden xl:block w-[120px] flex-shrink-0 relative">
                <SidebarAd side="left" />
              </div>

              {/* Content Page (Middle Column) */}
              <main className="flex-grow max-w-5xl relative z-10 py-10">
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

              {/* Vertical Ads Right */}
              <div className="hidden xl:block w-[120px] flex-shrink-0 relative">
                <SidebarAd side="right" />
              </div>
            </div>

            <AdBanner />
          </div>
          
          <Footer />
          <ScrollToTop />
        </div>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
