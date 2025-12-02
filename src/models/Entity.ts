/**
 * src/models/Entity.ts
 * Clase abstracta base para entidades con ID y timestamps.
 *
 * Provee abstracción y obliga a implementar "describe" (polimorfismo).
 */

/**
 * Entity — clase base abstracta.
 */
export abstract class Entity {
  protected readonly _id: string;
  protected _createdAt: string;
  protected _updatedAt: string;

  /**
   * Crea una entidad con id y timestamps.
   *
   * @param {string} id Identificador único.
   * @param {string} [createdAt] Fecha ISO de creación (opcional, para restaurar).
   */
  constructor(id: string, createdAt?: string) {
    this._id = id;
    const now = createdAt ?? new Date().toISOString();
    this._createdAt = now;
    this._updatedAt = now;
  }

  /**
   * ID de la entidad (lectura).
   */
  get id(): string {
    return this._id;
  }

  /**
   * Fecha ISO de creación.
   */
  get createdAt(): string {
    return this._createdAt;
  }

  /**
   * Fecha ISO de última edición.
   */
  get updatedAt(): string {
    return this._updatedAt;
  }

  /**
   * Actualiza el timestamp de última edición al momento actual.
   * Protected: sólo la entidad o subclases deben llamar esto.
   */
  protected touch(): void {
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Describe la entidad (debe implementarse en subclases).
   *
   * @abstract
   * @returns {string} Texto descriptivo de la entidad.
   */
  abstract describe(): string;
}
