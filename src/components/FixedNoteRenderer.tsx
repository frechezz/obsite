'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { getGitHubImageUrl } from '@/lib/imageUtils';

interface NoteRendererProps {
  content: string;
  className?: string;
}

const FixedNoteRenderer: React.FC<NoteRendererProps> = ({ content, className = '' }) => {
  // Обработчик ошибок загрузки изображений
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    console.error(`Ошибка загрузки изображения: ${img.src}`);
    img.alt = `Ошибка загрузки: ${img.alt}`;
    img.style.padding = '1rem';
    img.style.border = '1px dashed #ff5555';
    img.style.backgroundColor = '#fff1f1';
  };

  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null;
            
            // Формируем URL для изображений из публичного репозитория
            let imageSrc = src;
            
            try {
              // Если это не абсолютный URL, обрабатываем его
              if (!src.startsWith('http')) {
                console.log(`Обработка изображения: исходный путь = ${src}`);
                
                // Используем функцию из imageUtils для формирования корректного URL
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
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FixedNoteRenderer; 