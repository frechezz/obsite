'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiBook, FiCpu, FiGithub, FiHome, FiList, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import ThemeToggle from './ui/ThemeToggle';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 bg-white/5 dark:bg-gray-900/5 backdrop-blur-lg border-b border-white/10 dark:border-gray-800/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500"
          >
            <FiBook className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span>ObsidianNotes</span>
          </Link>

          {/* Центральные ссылки */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/all-notes"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <FiList className="mr-1" />
              Все заметки
            </Link>
            <Link
              href="/debug"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <FiCpu className="mr-1" />
              Диагностика
            </Link>
          </div>

          {/* Правая секция */}
          <div className="flex items-center space-x-4">
            <Link 
              href="https://github.com/frechezz/obsite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/20 transition-colors"
              title="Репозиторий проекта"
            >
              <FiGithub className="w-5 h-5" />
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar; 