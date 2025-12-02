/**
 * src/database/Database.ts
 * Wrapper genérico para persistencia simple basada en archivo JSON.
 *
 * Provee 'load' y 'save' para arrays; la lógica de negocio no debe usar fs directamente.
 */

import { readJsonFile, writeJsonFile } from "../utils/fileSystem";

/**
 * Database<T> — carga/guarda arrays de T en el archivo configurado.
 */
export class Database<T> {
  /**
   * Carga el contenido del archivo y lo retorna como array de T.
   * Si no hay datos, retorna defaultValue.
   *
   * @param {T[]} defaultValue Valor por defecto si el archivo está vacío o no existe.
   * @returns {Promise<T[]>}
   */
  async load(defaultValue: T[] = []): Promise<T[]> {
    const data = await readJsonFile<T[]>();
    return data ?? defaultValue;
  }

  /**
   * Guarda el array en el archivo (sobrescribe).
   *
   * @param {T[]} items Elementos a guardar.
   * @returns {Promise<void>}
   */
  async save(items: T[]): Promise<void> {
    await writeJsonFile(items);
  }
}

