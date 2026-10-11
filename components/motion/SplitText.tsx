import type { CSSProperties } from 'react';

interface SplitTextProps {
  text: string;
  /** Index du premier mot : enchaîne plusieurs lignes sans recommencer le décalage. */
  startIndex?: number;
  wordClassName?: string;
}

/**
 * Révèle le texte mot par mot (masque + translation) en CSS pur :
 * visible sans JavaScript, aucun coût d'hydratation. Styles dans globals.css (.split-word).
 */
export function SplitText({ text, startIndex = 0, wordClassName }: SplitTextProps) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="split-word">
            <span className={wordClassName} style={{ '--i': startIndex + i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  );
}
