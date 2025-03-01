import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

// Конфигурация GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const NOTES_PATH = process.env.NOTES_PATH || ''; // Путь к директории с заметками теперь корень репозитория

// Проверка наличия необходимых переменных окружения
const hasGitHubCredentials = GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO;

// Инициализация GitHub API клиента, только если есть учетные данные
// Примечание: В некоторых версиях Octokit метод называется getContents (с 's' на конце)
// В текущей версии используется getContent
const octokit = hasGitHubCredentials ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// Интерфейсы для типизации
export interface NoteMetadata {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  slug: string;
  isPublic: boolean;
  coverImage?: string;
}

export interface NoteContent {
  content: string;
  metadata: NoteMetadata;
}

// Тестовые заметки для отображения, когда нет GitHub-авторизации
const TEST_NOTES: NoteMetadata[] = [
  {
    title: "Начало работы с Obsidian",
    description: "Руководство по началу работы с Obsidian и настройке рабочего процесса",
    date: "2023-01-15",
    tags: ["obsidian", "tutorial", "productivity"],
    slug: "getting-started-with-obsidian",
    isPublic: true,
    coverImage: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=1266&auto=format&fit=crop",
  },
  {
    title: "Markdown синтаксис",
    description: "Полное руководство по синтаксису Markdown для оформления заметок",
    date: "2023-02-20",
    tags: ["markdown", "tutorial", "formatting"],
    slug: "markdown-syntax",
    isPublic: true,
  },
  {
    title: "Продвинутые плагины Obsidian",
    description: "Обзор полезных плагинов для расширения функциональности Obsidian",
    date: "2023-03-10",
    tags: ["obsidian", "plugins", "productivity"],
    slug: "advanced-obsidian-plugins",
    isPublic: true,
    coverImage: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1170&auto=format&fit=crop",
  },
];

const TEST_NOTE_CONTENT = `
# Пример заметки Obsidian

Это **демонстрационная** заметка, созданная для тестирования функциональности сайта.

## Поддерживаемые возможности

- Маркированные списки
- *Курсив* и **жирный** текст
- [Ссылки](https://obsidian.md)
- И многое другое!

### Пример кода

\`\`\`javascript
function hello() {
  console.log("Hello from Obsidian!");
}
\`\`\`

## Изображения

Вот пример того, как выглядят изображения:

![Пример изображения](https://images.unsplash.com/photo-1468421870903-4df1664ac249?w=800&auto=format&fit=crop)

А также Obsidian изображения:

![[Pasted image 20250301151803.png]]
`;

/**
 * Получает список всех заметок из репозитория
 */
export async function fetchAllNotes(): Promise<NoteMetadata[]> {
  // Если нет учетных данных GitHub, возвращаем тестовые заметки
  if (!hasGitHubCredentials) {
    console.log('Используются тестовые заметки, так как не указаны учетные данные GitHub');
    return TEST_NOTES;
  }

  try {
    // Получаем содержимое директории с заметками
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    const { data: files } = await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: NOTES_PATH,
    });

    if (!Array.isArray(files)) {
      throw new Error('Notes path is not a directory');
    }

    // Фильтруем только markdown файлы
    const markdownFiles = files.filter(
      (file) => file.type === 'file' && file.name.endsWith('.md')
    );

    // Получаем метаданные каждой заметки
    const notes = await Promise.all(
      markdownFiles.map(async (file) => {
        try {
          // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
          const { data: fileContent } = await octokit!.rest.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: file.path,
          });

          if ('content' in fileContent) {
            const content = Buffer.from(fileContent.content, 'base64').toString();
            const { data } = matter(content);
            
            return {
              ...data,
              slug: file.name.replace('.md', ''),
              isPublic: data.isPublic ?? false,
            } as NoteMetadata;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching note ${file.name}:`, error);
          return null;
        }
      })
    );

    return notes.filter((note): note is NoteMetadata => note !== null);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

/**
 * Конвертирует синтаксис Obsidian в стандартный Markdown
 */
function convertObsidianToMarkdown(content: string): string {
  // Конвертация Obsidian изображений: ![[image.png]] -> ![image](files/image.png)
  const obsidianImageRegex = /!\[\[(.*?)\]\]/g;
  
  return content.replace(obsidianImageRegex, (match, filename) => {
    // Извлекаем имя файла для использования в alt тексте
    const imageName = filename.split('/').pop();
    
    // Все изображения теперь в папке files внутри репозитория
    const imagePath = filename.includes('/') ? filename : `files/${filename}`;
    
    console.log(`Обрабатываем изображение: ${filename} -> ${imagePath}`);
    
    // Возвращаем стандартный markdown для изображения с корректным путем
    // Используем encodeURI для правильной обработки пробелов в URL
    return `![${imageName}](${encodeURI(imagePath)})`;
  });
}

/**
 * Получает содержимое конкретной заметки по слагу
 */
export async function fetchNoteBySlug(slug: string): Promise<NoteContent | null> {
  // Если нет учетных данных GitHub, возвращаем тестовую заметку
  if (!hasGitHubCredentials) {
    const testNote = TEST_NOTES.find(note => note.slug === slug);
    
    if (!testNote) {
      // Если запрашиваемой заметки нет среди тестовых, возвращаем первую тестовую заметку
      return {
        content: TEST_NOTE_CONTENT,
        metadata: TEST_NOTES[0],
      };
    }
    
    return {
      content: TEST_NOTE_CONTENT,
      metadata: testNote,
    };
  }

  try {
    // Создаем корректный путь к файлу, избегая проблем с символом "."
    // Если NOTES_PATH является ".", то просто используем имя файла без префикса
    const filePath = (NOTES_PATH && NOTES_PATH !== '.') 
      ? `${NOTES_PATH}/${slug}.md` 
      : `${slug}.md`;
    
    console.log(`Пытаемся получить файл по пути: ${filePath}`);
    
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    const { data: fileContent } = await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
    });

    if ('content' in fileContent) {
      const content = Buffer.from(fileContent.content, 'base64').toString();
      const { content: markdownContent, data } = matter(content);
      
      // Конвертируем Obsidian синтаксис в стандартный Markdown
      const processedContent = convertObsidianToMarkdown(markdownContent);
      
      return {
        content: processedContent,
        metadata: {
          ...data,
          slug,
          isPublic: data.isPublic ?? false,
        } as NoteMetadata,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching note ${slug}:`, error);
    return null;
  }
}

/**
 * Преобразует URL изображения GitHub в прямую ссылку
 */
export function getGitHubImageUrl(path: string): string {
  // Import using ES modules instead of require
  // const { getGitHubImageUrl: imageUtilGetGitHubImageUrl } = require('./imageUtils');
  // return imageUtilGetGitHubImageUrl(path);
  
  // Constructing the GitHub raw URL directly as a temporary fix
  const owner = process.env.GITHUB_OWNER || 'frechezz';
  const repo = process.env.NEXT_PUBLIC_IMAGES_REPO || 'publicobs';
  const branch = 'main';
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

/**
 * Проверяет, существует ли заметка с указанным слагом
 */
export async function checkNoteExists(slug: string): Promise<boolean> {
  // Если нет учетных данных GitHub, проверяем среди тестовых заметок
  if (!hasGitHubCredentials) {
    return TEST_NOTES.some(note => note.slug === slug) || slug === TEST_NOTES[0].slug;
  }

  try {
    // Создаем корректный путь к файлу, избегая проблем с символом "."
    // Если NOTES_PATH является ".", то просто используем имя файла без префикса
    const filePath = (NOTES_PATH && NOTES_PATH !== '.') 
      ? `${NOTES_PATH}/${slug}.md` 
      : `${slug}.md`;
    
    console.log(`Проверяем существование файла по пути: ${filePath}`);
    
    // Примечание: Если возникает ошибка, возможно, в вашей версии Octokit метод называется getContents
    await octokit!.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
    });
    
    return true;
  } catch (error) {
    console.error(`Ошибка при проверке существования заметки ${slug}:`, error);
    return false;
  }
} 