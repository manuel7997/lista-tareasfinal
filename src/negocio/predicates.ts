/**
 * src/negocio/predicates.ts
 * Predicados puros: cada predicado implementa una idea (un solo propósito).
 *
 * Orden lógico: predicados más restrictivos primero cuando se usen encadenados.
 */

import { Tarea } from "../models/Tarea";

/**
 * Predicado: ¿Está marcada como eliminada (soft delete)?
 *
 * @param {Tarea} t Tarea a evaluar.
 * @returns {boolean}
 */
export const isDeleted = (t: Tarea): boolean => t.deleted === true;

/**
 * Predicado: ¿Prioridad Alta?
 *
 * @param {Tarea} t
 * @returns {boolean}
 */
export const isHighPriority = (t: Tarea): boolean => t.prioridad === "Alta";

/**
 * Predicado: ¿La tarea está vencida (fecha < ahora)?
 *
 * @param {Tarea} t
 * @returns {boolean}
 */
export const isOverdue = (t: Tarea): boolean => {
  if (!t.vencimiento) return false;
  const d = new Date(t.vencimiento);
  if (isNaN(d.getTime())) return false;
  return d < new Date();
};

/**
 * Predicado combinador: devuelve un predicado que comprueba si la tarea
 * está relacionada con el id dado.
 *
 * @param {string} taskId
 * @returns {(t: Tarea) => boolean}
 */
export const isRelatedTo = (taskId: string) => (t: Tarea): boolean =>
  t.relacionadas.includes(taskId);
