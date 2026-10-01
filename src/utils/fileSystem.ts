/**
 * src/utils/fileSystem.ts
 * Abstracción para leer/escribir JSON desde/para el archivo `tareas.json`.
 *
 * Usa fs.promises internamente; maneja errores y devuelve valores seguros.
 */

import { promises as fs } from "fs";
import path from "path";

const DB_FILENAME = "tareas.json";

/**
 * Devuelve la ruta absoluta al archivo de datos en el directorio de trabajo.
 *
 * @returns {string} Ruta absoluta.
 */
const dataPath = (): string => path.resolve(process.cwd(), DB_FILENAME);

/**
 * Lee y parsea JSON del archivo. Si no existe o hay error, retorna null.
 *
 * @template T
 * @returns {Promise<T | null>} Contenido parseado o null.
 * @throws {Error} Si ocurre un error de lectura distinto a "no existe".
 */
export const readJsonFile = async <T>(): Promise<T | null> => {
  try {
    const raw = await fs.readFile(dataPath(), "utf-8");
    return JSON.parse(raw) as T;
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      return null;
    }

    throw e;
  }
};

/**
 * Escribe JSON con formato legible en el archivo de datos.
 *
 * @param {unknown} data Objeto a serializar.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la escritura.
 */
export const writeJsonFile = async (data: unknown): Promise<void> => {
  const raw = JSON.stringify(data, null, 2);
  await fs.writeFile(dataPath(), raw, "utf-8");
};