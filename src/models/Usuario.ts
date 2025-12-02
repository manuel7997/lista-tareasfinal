/**
 * src/models/Usuario.ts
 * Modelo simple de Usuario para complementar la carpeta models.
 *
 * Incluye JSDoc y ejemplo de uso.
 */

import { Entity } from "./Entity";

/**
 * Usuario — representa a una persona usuaria.
 */
export class Usuario extends Entity {
  private _nombre: string;

  /**
   * Crea un Usuario.
   *
   * @param {string} id ID único.
   * @param {string} nombre Nombre del usuario.
   */
  constructor(id: string, nombre: string) {
    super(id);
    this._nombre = nombre;
  }

  /**
   * Nombre (lectura).
   */
  get nombre(): string {
    return this._nombre;
  }

  /**
   * Cambia el nombre (y actualiza timestamp).
   *
   * @param {string} n Nuevo nombre.
   */
  setNombre(n: string): void {
    this._nombre = n;
    this.touch();
  }

  /**
   * Describe el usuario (polimorfismo).
   *
   * @returns {string}
   */
  describe(): string {
    return `Usuario: ${this._nombre}`;
  }

  /**
   * Serializa para JSON.
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      nombre: this._nombre,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
