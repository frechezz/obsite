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
  
  // Формируем URL для доступа к изображению из публичного репозитория
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Закодируем каждую часть пути отдельно для более правильной обработки
  const pathParts = cleanPath.split('/');
  const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
  const encodedPath = encodedPathParts.join('/');
  
  // Используем переменные окружения для формирования URL
  const owner = process.env.GITHUB_OWNER || 'frechezz';
  const repo = process.env.GITHUB_REPO || 'publicobs';
  
  return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/${encodedPath}`;
}
