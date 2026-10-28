import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WhatsAppButton: React.FC = () => {
  const { language } = useLanguage();
  const phoneNumber = '8801781822686';
  const message = encodeURIComponent(
    language === 'bn' 
      ? 'হ্যালো এসকে শপ, আমি একটি প্রোডাক্ট সম্পর্কে জানতে চাচ্ছি।'
      : 'Hello SK Shop, I would like to inquire about your collection or order.'
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact SK Shop on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#25D366] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium group"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="hidden sm:inline-block text-sm font-semibold tracking-wide">
        {language === 'bn' ? 'হোয়াটসঅ্যাপ সহায়তা' : 'Chat with Us'}
      </span>
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    </a>
  );
};
