/**
 * src/utils/id.ts
 * Generador de IDs (UUID v4).
 *
 * @example
 * import { generateId } from './utils/id';
 * const id = generateId(); // "c4e1f3bb-3205-4e94-ac19-42dcd71e7d9f"
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Genera un identificador único (UUID v4).
 *
 * @returns {string} ID único.
 */
export const generateId = (): string => uuidv4();
