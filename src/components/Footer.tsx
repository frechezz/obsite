'use client';

import React from 'react';
import Link from 'next/link';
import { FiGithub } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 mt-16 border-t border-white/10 dark:border-gray-800/30 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-center md:text-left">
              <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                ObsidianNotes
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                © {currentYear} Создано <Link href="https://github.com/frechezz" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">frechezz</Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="https://github.com/frechezz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="GitHub профиль"
            >
              <FiGithub className="w-5 h-5" />
            </Link>
            <Link 
              href="https://t.me/peeepaw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="Telegram"
            >
              <FaTelegramPlane className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 