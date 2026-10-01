/**
 * src/store/Store.ts
 * Encapsula la persistencia de Tarea (DB + conversión a objetos).
 *
 * La Store no contiene lógica de negocio; sólo carga/guarda y reconstruye objetos.
 */

import { Database } from "../database/Database";
import { Tarea, TareaJSON } from "../models/Tarea";

/**
 * Store — gestor de persistencia para Tarea.
 */
export class Store {
  private db = new Database<TareaJSON>();

  /**
   * Carga todas las tareas desde la DB y las transforma a objetos Tarea.
   *
   * @returns {Promise<Tarea[]>}
   */
  async loadAll(): Promise<Tarea[]> {
    const raw = await this.db.load([]);
    return raw.map((r: TareaJSON) => Tarea.fromJSON(r));
  }

  /**
   * Persiste la lista de tareas (serializando con toJSON).
   *
   * @param {Tarea[]} tareas Lista de Tarea a guardar.
   * @returns {Promise<void>}
   */
  async saveAll(tareas: Tarea[]): Promise<void> {
    const raw = tareas.map((t) => t.toJSON());
    await this.db.save(raw);
  }
}