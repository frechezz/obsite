import { fetchAllNotes } from "@/lib/github";
import NoteCard from "@/components/NoteCard";
import Button from "@/components/ui/Button";
import { FiGithub } from "react-icons/fi";

export default async function Home() {
  // Получаем только публичные заметки для отображения на главной странице
  const notes = await fetchAllNotes();
  const publicNotes = notes.filter((note) => note.isPublic);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero секция */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            Ваши заметки в стильной web3 оболочке
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Автоматически публикуйте заметки из Obsidian в современном веб-интерфейсе
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://github.com/frechezz/obsite" target="_blank" rel="noopener noreferrer">
              <Button className="flex items-center">
                <FiGithub className="mr-2" />
                GitHub репозиторий
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Секция с публичными заметками */}
      {publicNotes.length > 0 && (
        <section className="py-12">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Публичные заметки</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ознакомьтесь с доступными заметками
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicNotes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* Инструкции */}
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Как это работает</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Создайте заметки в Obsidian</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Создавайте заметки в Obsidian со всеми возможностями форматирования Markdown.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Добавьте метаданные</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Используйте Frontmatter с полями title, description, tags и isPublic.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Синхронизируйте с GitHub</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Храните ваши заметки в GitHub-репозитории для автоматической публикации.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Делитесь по ссылке</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Делитесь ссылками на конкретные заметки, приватные заметки доступны только по прямой ссылке.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
