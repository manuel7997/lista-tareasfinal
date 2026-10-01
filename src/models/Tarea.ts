/**
 * src/models/Tarea.ts
 * Modelo de Tarea con encapsulamiento, mutadores controlados, soft-delete y serialización.
 *
 * Implementa: Abstracción, Encapsulamiento, Herencia (extiende Entity) y Polimorfismo (describe()).
 */

import { Entity } from "./Entity";

/**
 * Tipos públicos usados por Tarea.
 */
export type Estado = "Pendiente" | "En Curso" | "Completada";
export type Dificultad = "Fácil" | "Media" | "Difícil";
export type Prioridad = "Alta" | "Media" | "Baja";

export type TareaJSON = {
  id: string;
  titulo: string;
  descripcion: string;
  estado: Estado;
  vencimiento: string | null;
  dificultad: Dificultad;
  prioridad: Prioridad;
  relacionadas: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Tarea — entidad con responsabilidad única: representar una tarea.
 */
export class Tarea extends Entity {
  private _titulo: string;
  private _descripcion: string;
  private _estado: Estado;
  private _vencimiento: string | null;
  private _dificultad: Dificultad;
  private _prioridad: Prioridad;
  private _relacionadas: string[];
  private _deleted: boolean;

  /**
   * Crea una nueva Tarea (constructor con valores por defecto).
   *
   * @param {string} id Identificador único (UUID).
   * @param {string} titulo Título de la tarea.
   * @param {string} descripcion Descripción opcional.
   * @param {Estado} estado Estado inicial.
   * @param {string | null} vencimiento Fecha ISO de vencimiento o null.
   * @param {Dificultad} dificultad Nivel de dificultad.
   * @param {Prioridad} prioridad Prioridad.
   * @param {string[]} relacionadas IDs de tareas relacionadas.
   * @param {string} [createdAt] Fecha de creación (para restauración).
   * @param {string} [updatedAt] Fecha de última edición (para restauración).
   * @param {boolean} [deleted=false] Marca de eliminación lógica.
   */
  constructor(
    id: string,
    titulo: string,
    descripcion = "",
    estado: Estado = "Pendiente",
    vencimiento: string | null = null,
    dificultad: Dificultad = "Fácil",
    prioridad: Prioridad = "Media",
    relacionadas: string[] = [],
    createdAt?: string,
    updatedAt?: string,
    deleted = false
  ) {
    super(id, createdAt);
this._titulo = titulo;
this._descripcion = descripcion;
this._estado = estado;
this._vencimiento = vencimiento;
this._dificultad = dificultad;
this._prioridad = prioridad;
this._relacionadas = relacionadas;
this._deleted = deleted;

if (updatedAt) {
  this._updatedAt = updatedAt;
}
  }

  /* ---------- Getters (sólo lectura desde fuera) ---------- */

  /**
   * Título de la tarea.
   */
  get titulo(): string {
    return this._titulo;
  }

  /**
   * Descripción.
   */
  get descripcion(): string {
    return this._descripcion;
  }

  /**
   * Estado actual.
   */
  get estado(): Estado {
    return this._estado;
  }

  /**
   * Fecha ISO de vencimiento o null.
   */
  get vencimiento(): string | null {
    return this._vencimiento;
  }

  /**
   * Dificultad (Fácil/Media/Difícil).
   */
  get dificultad(): Dificultad {
    return this._dificultad;
  }

  /**
   * Prioridad (Alta/Media/Baja).
   */
  get prioridad(): Prioridad {
    return this._prioridad;
  }

  /**
   * IDs de tareas relacionadas.
   */
  get relacionadas(): string[] {
    return [...this._relacionadas];
  }

  /**
   * Indicador de eliminación lógica (soft-delete).
   */
  get deleted(): boolean {
    return this._deleted;
  }

  /* ---------- Mutadores (encapsulados) ---------- */

  /**
   * Cambia el título y actualiza la última edición.
   *
   * @param {string} nuevo Nuevo título.
   * @returns {void}
   */
  setTitulo(nuevo: string): void {
    this._titulo = nuevo;
    this.touch();
  }

  /**
   * Cambia la descripción y actualiza la última edición.
   *
   * @param {string} nuevo Nueva descripción.
   * @returns {void}
   */
  setDescripcion(nuevo: string): void {
    this._descripcion = nuevo;
    this.touch();
  }

  /**
   * Actualiza el estado.
   *
   * @param {Estado} nuevo Nuevo estado.
   */
  setEstado(nuevo: Estado): void {
    this._estado = nuevo;
    this.touch();
  }

  /**
   * Establece o borra la fecha de vencimiento.
   *
   * @param {string | null} iso Fecha ISO o null.
   */
  setVencimiento(iso: string | null): void {
    this._vencimiento = iso;
    this.touch();
  }

  /**
   * Cambia la dificultad.
   *
   * @param {Dificultad} d Nueva dificultad.
   */
  setDificultad(d: Dificultad): void {
    this._dificultad = d;
    this.touch();
  }

  /**
   * Cambia la prioridad.
   *
   * @param {Prioridad} p Nueva prioridad.
   */
  setPrioridad(p: Prioridad): void {
    this._prioridad = p;
    this.touch();
  }

  /**
   * Añade una relación (ID) a la lista de relacionadas.
   *
   * @param {string} id ID de la tarea relacionada.
   */
  addRelacionada(id: string): void {
    this._relacionadas = [...this._relacionadas, id];
    this.touch();
  }

  /**
   * Marca la tarea como eliminada (soft delete) y actualiza timestamp.
   */
  markDeleted(): void {
    this._deleted = true;
    this.touch();
  }

  /**
   * Serializa la tarea para persistencia (JSON-safe).
   *
   * @returns {TareaJSON} Objeto serializable.
   */
  toJSON(): TareaJSON {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      estado: this.estado,
      vencimiento: this.vencimiento,
      dificultad: this.dificultad,
      prioridad: this.prioridad,
      relacionadas: this.relacionadas,
      deleted: this.deleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
 * Reconstruye una Tarea a partir de un objeto (p. ej. JSON).
 *
 * @param {TareaJSON} obj Objeto con propiedades serializadas.
 * @returns {Tarea} Instancia restaurada.
 * @example
 * const tarea = Tarea.fromJSON(jsonObj);
 */
  static fromJSON(obj: TareaJSON): Tarea {
    return new Tarea(
      obj.id,
      obj.titulo,
      obj.descripcion,
      obj.estado,
      obj.vencimiento ?? null,
      obj.dificultad,
      obj.prioridad,
      obj.relacionadas ?? [],
      obj.createdAt,
      obj.updatedAt
    );
  }

  /**
   * Implementación de polimorfismo: describe la tarea de forma humana.
   *
   * @returns {string}
   */
  describe(): string {
    return `${this.titulo} [${this.dificultad}] (${this.estado})`;
  }
}
