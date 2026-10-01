/**
 * src/negocio/tareas.ts
 * Servicio principal de negocio: TaskService.
 *
 * - Aplica validaciones en pipeline (validators.chainValidations).
 * - Provee add/update/softDelete/hardDelete.
 * - Provee consultas puras (getHighPriority, getRelated, getOverdue).
 * - Provee listSorted y stats (reportes) usando funciones puras (map/filter/reduce).
 *
 * La clase expone métodos con la mínima cantidad de argumentos razonable.
 */

import { generateId } from "../utils/id";
import { Store } from "../store/Store";
import { Tarea, Dificultad, Prioridad, Estado } from "../models/Tarea";
import * as predicates from "./predicates";
import * as validators from "./validators";
import * as reports from "./reports";

export class TaskService {
  private store = new Store();

  /**
   * Carga todas las tareas desde la store.
   *
   * @returns {Promise<Tarea[]>}
   */
  async loadAll(): Promise<Tarea[]> {
    return this.store.loadAll();
  }

  /**
   * Crea y persiste una nueva tarea tras validar.
   *
   * @param {Object} props Propiedades de la nueva tarea.
   * @param {string} props.titulo
   * @param {string} [props.descripcion]
   * @param {string | null} [props.vencimiento]
   * @param {Dificultad} [props.dificultad]
   * @param {Prioridad} [props.prioridad]
   * @param {string[]} [props.relacionadas]
   * @returns {Promise<{ok:true,tarea:Tarea} | {ok:false,reason:string}>}
   */
  async addTask(props: {
    titulo: string;
    descripcion?: string;
    vencimiento?: string | null;
    dificultad?: Dificultad;
    prioridad?: Prioridad;
    relacionadas?: string[];
  }): Promise<{ ok: true; tarea: Tarea } | { ok: false; reason: string }> {
    const validation = validators.chainValidations(
      () => validators.validarTituloNoVacio(props.titulo),
      () => validators.validarFechaISO(props.vencimiento ?? null),
      () => validators.validarDificultad(props.dificultad ?? "Fácil"),
      () => validators.validarPrioridad(props.prioridad ?? "Media")
    );
    if (!validation.ok) return { ok: false, reason: validation.reason };

    const id = generateId();
    const tarea = new Tarea(
      id,
      props.titulo,
      props.descripcion ?? "",
      "Pendiente",
      props.vencimiento ?? null,
      (props.dificultad as Dificultad) ?? "Fácil",
      (props.prioridad as Prioridad) ?? "Media",
      props.relacionadas ?? []
    );

    const tareas = await this.store.loadAll();
    const nuevas = [...tareas, tarea];
    await this.store.saveAll(nuevas);

    return { ok: true, tarea };
  }

  /**
   * Actualiza una tarea mediante un parche.
   *
   * @param {string} id ID de la tarea.
   * @param {Partial<{titulo:string;descripcion:string;estado:Estado;vencimiento:string|null;dificultad:Dificultad;prioridad:Prioridad}>} patch
   * @returns {Promise<{ok:true} | {ok:false,reason:string}>}
   */
  async updateTask(
    id: string,
    patch: Partial<{ titulo: string; descripcion: string; estado: Estado; vencimiento: string | null; dificultad: Dificultad; prioridad: Prioridad }>
  ): Promise<{ ok: true } | { ok: false; reason: string }> {
    const tareas = await this.store.loadAll();
    if (!tareas.some((t) => t.id === id)) return { ok: false, reason: "ID no encontrado" };

    const nuevas = tareas.map((t) => {
      if (t.id !== id) return t;
      const copia = Tarea.fromJSON(t.toJSON());
      if (patch.titulo) copia.setTitulo(patch.titulo);
      if (patch.descripcion) copia.setDescripcion(patch.descripcion);
      if (patch.estado) copia.setEstado(patch.estado);
      if (typeof patch.vencimiento !== "undefined") copia.setVencimiento(patch.vencimiento ?? null);
      if (patch.dificultad) copia.setDificultad(patch.dificultad);
      if (patch.prioridad) copia.setPrioridad(patch.prioridad);
      return copia;
    });

    await this.store.saveAll(nuevas);
    return { ok: true };
  }

  /**
   * Soft delete: marca como eliminada.
   *
   * @param {string} id
   * @returns {Promise<{ok:true} | {ok:false,reason:string}>}
   */
  async softDelete(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    const tareas = await this.store.loadAll();
    if (!tareas.some((t) => t.id === id)) return { ok: false, reason: "ID no encontrado" };
    const nuevas = tareas.map((t) => (t.id === id ? (() => { const c = Tarea.fromJSON(t.toJSON()); c.markDeleted(); return c; })() : t));
    await this.store.saveAll(nuevas);
    return { ok: true };
  }

  /**
   * Hard delete: elimina permanentemente del array.
   *
   * @param {string} id
   * @returns {Promise<{ok:true} | {ok:false,reason:string}>}
   */
  async hardDelete(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
    const tareas = await this.store.loadAll();
    if (!tareas.some((t) => t.id === id)) return { ok: false, reason: "ID no encontrado" };
    const nuevas = tareas.filter((t) => t.id !== id);
    await this.store.saveAll(nuevas);
    return { ok: true };
  }

  /**
   * Devuelve las tareas de prioridad alta (funcional).
   *
   * @param {boolean} [includeDeleted=false]
   * @returns {Promise<Tarea[]>}
   */
  async getHighPriority(includeDeleted = false): Promise<Tarea[]> {
    const tareas = await this.store.loadAll();
    return tareas.filter((t) => (includeDeleted ? true : !t.deleted) && predicates.isHighPriority(t));
  }

  /**
   * Devuelve tareas relacionadas a taskId.
   *
   * @param {string} taskId
   * @param {boolean} [includeDeleted=false]
   * @returns {Promise<Tarea[]>}
   */
  async getRelated(taskId: string, includeDeleted = false): Promise<Tarea[]> {
    const tareas = await this.store.loadAll();
    return tareas.filter((t) => (includeDeleted ? true : !t.deleted) && predicates.isRelatedTo(taskId)(t));
  }

  /**
   * Devuelve tareas vencidas.
   *
   * @param {boolean} [includeDeleted=false]
   * @returns {Promise<Tarea[]>}
   */
  async getOverdue(includeDeleted = false): Promise<Tarea[]> {
  const tareas = await this.store.loadAll();
  const fechaActual = new Date();

  return tareas.filter(
    (t) =>
      (includeDeleted ? true : !t.deleted) &&
      predicates.isOverdue(fechaActual)(t)
  );
}

  /**
   * Lista ordenada por: titulo|vencimiento|creacion|dificultad.
   *
   * @param {"titulo"|"vencimiento"|"creacion"|"dificultad"} [by="creacion"]
   * @param {boolean} [asc=true]
   * @param {boolean} [includeDeleted=false]
   * @returns {Promise<Tarea[]>}
   */
  async listSorted(by: "titulo" | "vencimiento" | "creacion" | "dificultad" = "creacion", asc = true, includeDeleted = false): Promise<Tarea[]> {
    const tareas = await this.store.loadAll();
    const base = tareas.filter((t) => (includeDeleted ? true : !t.deleted));

    switch (by) {
      case "titulo":
        return [...base].sort((a, b) => (asc ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo)));
      case "vencimiento":
        return [...base].sort((a, b) => {
          const va = a.vencimiento ?? "";
          const vb = b.vencimiento ?? "";
          return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
      case "dificultad":
        return [...base].sort((a, b) => (asc ? a.dificultad.localeCompare(b.dificultad) : b.dificultad.localeCompare(a.dificultad)));
      case "creacion":
      default:
        return [...base].sort((a, b) => (asc ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));
    }
  }

  /**
   * Estadísticas básicas: total, byEstado, byDificultad.
   *
   * @param {boolean} [includeDeleted=false]
   * @returns {Promise<{total:number,byEstado:Record<string,number>,byDificultad:Record<string,number>}>}
   */
  async stats(includeDeleted = false) {
    const tareas = await this.store.loadAll();
    const total = tareas.filter((t) => (includeDeleted ? true : !t.deleted)).length;
    const byEstado = tareas
      .filter((t) => (includeDeleted ? true : !t.deleted))
      .reduce((acc: Record<string, number>, t) => {
        acc[t.estado] = (acc[t.estado] || 0) + 1;
        return acc;
      }, {});
    const byDificultad = tareas
      .filter((t) => (includeDeleted ? true : !t.deleted))
      .reduce((acc: Record<string, number>, t) => {
        acc[t.dificultad] = (acc[t.dificultad] || 0) + 1;
        return acc;
      }, {});
    return { total, byEstado, byDificultad };
  }
}
