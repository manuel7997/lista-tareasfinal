/**
 * src/negocio/emojis.ts
 * Mapeos de dificultad a emojis y estrellas (presentación).
 */

/**
 * Mapea dificultad a una representación emoji.
 *
 * @param {string} dificultad
 * @returns {string}
 */
export const difficultyToEmoji = (dificultad: string): string => {
  switch (dificultad.toLowerCase()) {
    case "fácil":
    case "facil":
      return "🌕";
    case "media":
    case "medio":
      return "🌕🌕🌗";
    case "difícil":
    case "dificil":
      return "🌕🌕🌕";
    default:
      return "★☆☆";
  }
};

/**
 * Mapea dificultad a estrellas (★).
 *
 * @param {string} dificultad
 * @returns {string}
 */
export const difficultyToStars = (dificultad: string): string => {
  switch (dificultad.toLowerCase()) {
    case "fácil":
    case "facil":
      return "★☆☆";
    case "media":
    case "medio":
      return "★★☆";
    case "difícil":
    case "dificil":
      return "★★★";
    default:
      return "☆☆☆";
  }
};
