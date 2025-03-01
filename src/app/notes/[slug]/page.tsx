import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { fetchNoteBySlug, checkNoteExists } from "@/lib/github";
import NoteRenderer from "@/components/NoteRenderer";
import Card from "@/components/ui/Card";

interface NotePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: NotePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Ensure params is awaited before destructuring
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  try {
    // Проверяем существование заметки
    const noteExists = await checkNoteExists(slug);
    if (!noteExists) {
      console.error(`Заметка не найдена: ${slug}`);
      return {
        title: "Заметка не найдена",
      };
    }

    const note = await fetchNoteBySlug(slug);
    if (!note) {
      console.error(`Не удалось загрузить заметку: ${slug}`);
      return {
        title: "Заметка не найдена",
      };
    }

    return {
      title: `${note.metadata.title} | ObsidianNotes`,
      description: note.metadata.description || "Заметка из Obsidian",
    };
  } catch (error) {
    console.error(`Ошибка при загрузке метаданных: ${error}`);
    return {
      title: "Ошибка загрузки заметки",
    };
  }
}

export default async function NotePage({ params }: NotePageProps) {
  // Ensure params is awaited before destructuring
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  try {
    const note = await fetchNoteBySlug(slug);

    if (!note) {
      console.error(`Заметка не найдена в NotePage: ${slug}`);
      notFound();
    }

    // Проверяем доступ (доступны только публичные заметки или по прямой ссылке)
    const { metadata, content } = note;

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <article className="mt-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              {metadata.title}
            </h1>
            
            {metadata.description && (
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {metadata.description}
              </p>
            )}
            
            {metadata.date && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(metadata.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}

            {metadata.coverImage && (
              <div className="mt-8 mb-10 overflow-hidden rounded-xl">
                <img
                  src={metadata.coverImage}
                  alt={metadata.title}
                  className="w-full h-auto"
                />
              </div>
            )}
          </header>

          <Card className="p-8">
            <NoteRenderer content={content} />
          </Card>
        </article>
      </div>
    );
  } catch (error) {
    console.error(`Ошибка при рендеринге страницы: ${error}`);
    notFound();
  }
} 