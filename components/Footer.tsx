import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-inner mt-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4">
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/imprint" className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-lg transition">Imprint</Link>
          <Link href="/privacy" className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-lg transition">Privacy</Link>
        </div>
        <div className="flex gap-4 items-center">
          <a href="https://github.com/im23b-hubere" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring rounded-full p-1">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.422-.012 2.753 0 .268.18.579.688.481C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z" /></svg>
          </a>
        </div>
      </div>
    </footer>
  )
} 