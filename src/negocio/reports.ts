/**
 * src/negocio/reports.ts
 * Reportes funcionales (sin bucles): total, counts por estado y dificultad, porcentajes.
 */

import { Tarea } from "../models/Tarea";

/**
 * Devuelve el total de tareas (excluye soft-deleted por defecto).
 *
 * @param {Tarea[]} tareas
 * @param {boolean} [includeDeleted=false]
 * @returns {number}
 */
export const totalTareas = (tareas: Tarea[], includeDeleted = false): number =>
  tareas.filter((t) => (includeDeleted ? true : !t.deleted)).length;

/**
 * Cuenta por estado (objeto estado -> cantidad).
 *
 * @param {Tarea[]} tareas
 * @param {boolean} [includeDeleted=false]
 * @returns {Record<string, number>}
 */
export const countByEstado = (tareas: Tarea[], includeDeleted = false): Record<string, number> =>
  tareas
    .filter((t) => (includeDeleted ? true : !t.deleted))
    .reduce((acc: Record<string, number>, t) => {
      acc[t.estado] = (acc[t.estado] || 0) + 1;
      return acc;
    }, {});

/**
 * Cuenta por dificultad.
 *
 * @param {Tarea[]} tareas
 * @param {boolean} [includeDeleted=false]
 * @returns {Record<string, number>}
 */
export const countByDificultad = (tareas: Tarea[], includeDeleted = false): Record<string, number> =>
  tareas
    .filter((t) => (includeDeleted ? true : !t.deleted))
    .reduce((acc: Record<string, number>, t) => {
      acc[t.dificultad] = (acc[t.dificultad] || 0) + 1;
      return acc;
    }, {});

/**
 * Convierte cuenta a porcentaje (dos decimales).
 *
 * @param {number} count
 * @param {number} total
 * @returns {number}
 */
export const toPercent = (count: number, total: number): number =>
  total === 0 ? 0 : Math.round((count / total) * 10000) / 100;

/**
 * Stats por estado: devuelve { total, byEstado: { estado: {count, percent} } }.
 *
 * @param {Tarea[]} tareas
 * @returns {{ total: number; byEstado: Record<string, { count: number; percent: number }> }}
 */
export const statsByEstado = (tareas: Tarea[]) => {
  const total = totalTareas(tareas);
  const counts = countByEstado(tareas);
  const keys = Object.keys(counts);
  const result = keys.reduce((acc: Record<string, { count: number; percent: number }>, k) => {
    const c = counts[k];
    acc[k] = { count: c, percent: toPercent(c, total) };
    return acc;
  }, {});
  return { total, byEstado: result };
};

/**
 * Stats por dificultad: { total, byDificultad: { dif: {count, percent} } }.
 *
 * @param {Tarea[]} tareas
  * @returns {{ total: number; byDificultad: Record<string, { count: number; percent: number }> }}
 */
export const statsByDificultad = (tareas: Tarea[]) => {
  const total = totalTareas(tareas);
  const counts = countByDificultad(tareas);
  const keys = Object.keys(counts);
  const result = keys.reduce((acc: Record<string, { count: number; percent: number }>, k) => {
    const c = counts[k];
    acc[k] = { count: c, percent: toPercent(c, total) };
    return acc;
  }, {});
  return { total, byDificultad: result };
};
