export function GitHubIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function TelegramIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.19-.06-.05-.16-.03-.23-.02-.1.02-1.74 1.11-4.92 3.26-.47.32-.89.48-1.27.47-.42-.01-1.23-.24-1.83-.43-.74-.24-1.33-.37-1.28-.78.03-.21.32-.43.87-.66 3.42-1.49 5.71-2.47 6.86-2.95 3.27-1.36 3.95-1.6 4.4-1.6.1 0 .32.02.46.14.12.09.15.22.17.31-.01.07.01.23-.02.37z" />
    </svg>
  );
}

export default function SocialLinks({ className = "socialIcons", size = 20 }) {
  return (
    <div className={className} aria-label="Social profiles">
      <a
        href="https://github.com/SAVTHEK11DD"
        target="_blank"
        rel="noopener noreferrer"
        className="socialIconLink"
        aria-label="GitHub profile"
        title="GitHub"
      >
        <GitHubIcon size={size} />
      </a>
      <a
        href="https://t.me/not_sav0"
        target="_blank"
        rel="noopener noreferrer"
        className="socialIconLink"
        aria-label="Telegram profile"
        title="Telegram"
      >
        <TelegramIcon size={size} />
      </a>
    </div>
  );
}
