import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Конфигурация GitHub для публичного репозитория
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = 'frechezz';
const GITHUB_REPO = 'publicobs';

// Инициализация GitHub API клиента
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры из URL
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    // Проверяем, что путь указан
    if (!path) {
      return new NextResponse('Path parameter is required', { status: 400 });
    }
    
    // Формируем полный путь к файлу
    let filePath = path;
    
    console.log(`Запрос изображения: ${filePath}`);
    
    // Получаем содержимое файла через GitHub API
    const response = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      mediaType: {
        format: 'raw',
      },
    });
    
    // Проверяем, что это бинарные данные
    if (!(response.data instanceof ArrayBuffer) && !Buffer.isBuffer(response.data)) {
      return new NextResponse('Not an image file', { status: 400 });
    }
    
    // Определяем тип контента по расширению файла
    let contentType = 'application/octet-stream';
    if (path.endsWith('.png')) contentType = 'image/png';
    else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (path.endsWith('.gif')) contentType = 'image/gif';
    else if (path.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (path.endsWith('.webp')) contentType = 'image/webp';
    
    // Возвращаем изображение с правильным Content-Type
    return new NextResponse(response.data as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('Error serving image:', error);
    
    // Если изображение не найдено, пробуем перенаправить на прямую ссылку GitHub
    if (error.status === 404) {
      const path = request.nextUrl.searchParams.get('path') || '';
      const redirectUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(path)}`;
      return NextResponse.redirect(redirectUrl);
    }
    
    // Возвращаем ошибку со статусом
    return new NextResponse(
      `Error fetching image: ${error.message || 'Unknown error'}`, 
      { status: error.status || 500 }
    );
  }
} 