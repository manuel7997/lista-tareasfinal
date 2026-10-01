export type ValidationResult = { ok: true } | { ok: false; reason: string };

/**
 * Valida que el título no esté vacío.
 *
 * @param {string} titulo
 * @returns {ValidationResult}
 */
export const validarTituloNoVacio = (titulo: string): ValidationResult =>
  titulo.trim().length > 0 ? { ok: true } : { ok: false, reason: "Título vacío" };

/**
 * Valida que la fecha ISO sea válida o nula.
 *
 * @param {string | null} iso
 * @returns {ValidationResult}
 */
export const validarFechaISO = (iso: string | null): ValidationResult => {
  if (!iso) return { ok: true }; // permitir vacío
  const d = new Date(iso);
  return isNaN(d.getTime()) ? { ok: false, reason: "Fecha vencimiento inválida" } : { ok: true };
};

/**
 * Normaliza strings para comparar sin acentos ni mayúsculas.
 *
 * @param s string
 */
const normalizar = (s: string): string =>
  s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Valida dificultad: fácil/media/difícil
 *
 * @param {unknown} d
 * @returns {ValidationResult}
 */
export const validarDificultad = (d: unknown): ValidationResult => {
  if (typeof d !== "string") return { ok: false, reason: "Dificultad inválida" };

  const v = normalizar(d);

  if (["facil", "media", "dificil"].includes(v)) return { ok: true };

  return { ok: false, reason: "Dificultad inválida" };
};

/**
 * Valida prioridad: alta/media/baja
 *
 * @param {unknown} p
 * @returns {ValidationResult}
 */
export const validarPrioridad = (p: unknown): ValidationResult => {
  if (typeof p !== "string") return { ok: false, reason: "Prioridad inválida" };

  const v = normalizar(p);

  if (["alta", "media", "baja"].includes(v)) return { ok: true };

  return { ok: false, reason: "Prioridad inválida" };
};

/**
 * Encadenador: recibe funciones validadoras (sin argumentos) y las aplica en orden.
 * Devuelve el primer error o {ok:true}.
 *
 * @param {Array<() => ValidationResult>} validators
 * @returns {ValidationResult}
 */
export const chainValidations = (...validators: (() => ValidationResult)[]): ValidationResult =>
  validators.map((v) => v()).find((r) => r.ok === false) ?? { ok: true };

export const validarEstado = (estado: unknown): ValidationResult => {
  const estados = ["Pendiente", "En Curso", "Completada"];

  return typeof estado === "string" && estados.includes(estado)
    ? { ok: true }
    : { ok: false, reason: "Estado inválido" };
};

