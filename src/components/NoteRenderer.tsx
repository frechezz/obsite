'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { getGitHubImageUrl } from '@/lib/imageUtils';

interface NoteRendererProps {
  content: string;
  className?: string;
}

const NoteRenderer: React.FC<NoteRendererProps> = ({ content, className = '' }) => {
  // Обработчик ошибок загрузки изображений
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    console.error(`Ошибка загрузки изображения: ${img.src}`);
    img.alt = `Ошибка загрузки: ${img.alt}`;
    img.style.padding = '1rem';
    img.style.border = '1px dashed #ff5555';
    img.style.backgroundColor = '#fff1f1';
  };

  // Предварительно обрабатываем контент для поиска и замены Obsidian-синтаксиса
  const processedContent = useMemo(() => {
    // Регулярное выражение для поиска Obsidian-синтаксиса изображений
    const obsidianImageRegex = /!\[\[(.*?)\]\]/g;
    
    // Регулярное выражение для поиска стандартного markdown синтаксиса с незакодированными пробелами
    const standardImageRegex = /!\[(.*?)\]\((.*?)\)/g;
    
    // Сначала заменяем Obsidian-синтаксис на стандартный markdown
    let result = content.replace(obsidianImageRegex, (match, filename) => {
      // Извлекаем имя файла для alt-текста
      const imageName = filename.split('/').pop() || filename;
      // Предполагаем, что все изображения находятся в папке files, если не указан полный путь
      const imagePath = filename.includes('/') ? filename : `files/${filename}`;
      
      console.log(`Преобразовано изображение: ${match} -> ${imagePath}`);
      
      // Создаем корректную markdown ссылку с закодированным URL
      // Кодируем только путь, не alt-текст
      return `![${imageName}](${encodeURI(imagePath)})`;
    });
    
    // Затем проверяем стандартные markdown ссылки и исправляем URL с пробелами
    result = result.replace(standardImageRegex, (match, altText, url) => {
      // Если URL уже содержит %20 или другие закодированные символы, оставляем как есть
      if (url.includes('%')) {
        return match;
      }
      
      // Иначе кодируем URL для безопасного использования
      return `![${altText}](${encodeURI(url)})`;
    });
    
    return result;
  }, [content]);

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null;
            
            // Более надежный способ формирования URL для изображений
            let imageSrc = src;
            
            try {
              // Если это не абсолютный URL, обрабатываем его через нашу функцию
              if (!src.startsWith('http')) {
                console.log(`Обработка изображения: исходный путь = ${src}`);
                // Формируем полный URL к GitHub репозиторию
                imageSrc = getGitHubImageUrl(src);
                console.log(`Обработка изображения: итоговый URL = ${imageSrc}`);
              }
            } catch (error) {
              console.error('Ошибка обработки URL изображения:', error);
            }
            
            return (
              <img
                src={imageSrc}
                alt={alt || 'Изображение'}
                className="w-full h-auto my-6 rounded-lg shadow-lg dark:shadow-slate-700"
                onError={handleImageError}
                loading="lazy"
                {...props}
              />
            );
          },
          a: ({ node, children, href, ...props }) => {
            if (!href) return null;
            
            return (
              <a 
                href={href} 
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return (
              <code 
                className={`${className} font-mono text-sm rounded-md px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200`} 
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <pre 
              className="overflow-x-auto rounded-lg p-4 bg-gray-100 dark:bg-gray-800 shadow-inner my-6 text-gray-800 dark:text-gray-200" 
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default NoteRenderer; 