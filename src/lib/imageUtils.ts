/**
 * Utility functions for handling images
 */

/**
 * Преобразует URL изображения в URL для прямого доступа из публичного репозитория
 * @param path Путь к изображению
 * @returns URL для доступа к изображению из публичного репозитория
 */
export function getGitHubImageUrl(path: string): string {
  // Если это уже абсолютный URL, возвращаем его без изменений
  if (path.startsWith('http')) {
    return path;
  }
  
  // Убираем кодирование URI, если оно уже присутствует
  let decodedPath = path;
  try {
    // Проверяем наличие закодированных символов и декодируем, чтобы избежать двойного кодирования
    if (path.includes('%')) {
      decodedPath = decodeURIComponent(path);
    }
  } catch (e) {
    // Если произошла ошибка декодирования, используем исходный путь
    console.warn('Ошибка декодирования пути:', e);
  }
  
  // Обрабатываем Obsidian-стиль ссылки ![[filename.png]]
  const obsidianMatch = decodedPath.match(/!\[\[(.*?)\]\]/);
  if (obsidianMatch) {
    path = obsidianMatch[1];
  } else {
    path = decodedPath;
  }
  
  // Если путь не содержит '/', и не указана директория files, добавляем ее
  if (!path.includes('/') && !path.startsWith('files/')) {
    path = `files/${path}`;
  }
  
  // Используем переменные окружения для формирования URL
  const owner = process.env.GITHUB_OWNER || 'frechezz';
  const repo = process.env.GITHUB_REPO || 'publicobs';
  const branch = process.env.GITHUB_BRANCH || 'main';
  
  // Формируем корректный URL, добавляя один раз кодирование только для имени файла
  let url = `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/`;
  
  // Разбиваем путь и кодируем каждую часть отдельно
  const pathParts = path.split('/');
  const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
  url += encodedPathParts.join('/');
  
  return url;
}
