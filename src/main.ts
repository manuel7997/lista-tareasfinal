/**
 * src/main.ts
 * Interfaz de presentación (sin lógica de negocio).
 *
 * El archivo únicamente solicita datos al usuario y delega al servicio.
 * Contiene JSDoc y ejemplos de uso en comentarios.
 */

import promptSync from "prompt-sync";
import { TaskService } from "./negocio/tareas";
import { difficultyToEmoji, difficultyToStars } from "./negocio/emojis";

const prompt = promptSync({ sigint: true });
const service = new TaskService();

/**
 * Muestra una tarea en formato humano legible (presentación).
 *
 * @param {any} t Objeto Tarea (serializable).
 * @param {number} idx Índice para mostrar.
 */
const showTask = (t: any, idx: number) => {
  console.log(
    `${idx}. ${t.titulo} [${t.dificultad} ${difficultyToEmoji(t.dificultad)} ${difficultyToStars(t.dificultad)}] ID:${t.id} Estado:${t.estado} Venc:${t.vencimiento ?? "-"} ${t.deleted ? "[ELIMINADA]" : ""}`
  );
};

/**
 * Bucle principal (presentación). No contiene lógica de negocio.
 */
const run = async () => {
  while (true) {
    console.log("\n--- MENÚ ---");
    console.log("1) Agregar tarea");
    console.log("2) Mostrar tareas (elegir orden)");
    console.log("3) Editar tarea (delegado)");
    console.log("4) Eliminar (soft)");
    console.log("5) Eliminar (hard)");
    console.log("6) Estadísticas");
    console.log("7) Consultas (prioridad/relacionadas/vencidas)");
    console.log("0) Salir");

    const opt = prompt("> ");

    if (opt === "0") {
      console.log("Saliendo...");
      break;
    }

    // Delegamos TODO al servicio de negocio; main no implementa reglas de negocio.
    if (opt === "1") {
      const titulo = prompt("Título: ");
      const descripcion = prompt("Descripción (opcional): ");
      const venc = prompt("Vencimiento (YYYY-MM-DD, opcional): ");
      const dificultad = prompt("Dificultad (Fácil/Media/Difícil): ");
      const prioridad = prompt("Prioridad (Alta/Media/Baja): ");
      const relacionadas = prompt("IDs relacionadas (coma-separated, opcional): ");
      const rel = relacionadas ? relacionadas.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

      const res = await service.addTask({
        titulo,
        descripcion,
        vencimiento: venc || null,
        dificultad: (dificultad as any) || "Fácil",
        prioridad: (prioridad as any) || "Media",
        relacionadas: rel,
      });

      if (!res.ok) {
        console.log("Error:", res.reason);
      } else {
        console.log("Tarea creada con ID:", res.tarea.id);
      }
      continue;
    }

    if (opt === "2") {
      const by = prompt("Ordenar por (titulo/vencimiento/creacion/dificultad) o Enter para default: ");
      const asc = prompt("Ascendente? (s/n): ") !== "n";
      const list = await service.listSorted((by as any) || "creacion", asc);
      list.forEach(showTask);
      continue;
    }

    if (opt === "3") {
      const id = prompt("ID a editar: ");
      const titulo = prompt("Nuevo título (enter para mantener): ");
      const descripcion = prompt("Nueva descripción (enter para mantener): ");
      const estado = prompt("Nuevo estado (Pendiente/En Curso/Completada) (enter para mantener): ");
      const dificultad = prompt("Nueva dificultad (Fácil/Media/Difícil) (enter para mantener): ");
      const venc = prompt("Nuevo vencimiento (YYYY-MM-DD) (enter para mantener): ");

      const patch: any = {};
      if (titulo) patch.titulo = titulo;
      if (descripcion) patch.descripcion = descripcion;
      if (estado) patch.estado = estado;
      if (dificultad) patch.dificultad = dificultad;
      if (venc) patch.vencimiento = venc || null;

      const r = await service.updateTask(id, patch);
      if (!r.ok) console.log("Error:", r.reason);
      else console.log("Tarea actualizada.");
      continue;
    }

    if (opt === "4") {
      const id = prompt("ID a soft-delete: ");
      const r = await service.softDelete(id);
      console.log(r.ok ? "Marcada como eliminada." : `Error: ${r.reason}`);
      continue;
    }

    if (opt === "5") {
      const id = prompt("ID a hard-delete: ");
      const r = await service.hardDelete(id);
      console.log(r.ok ? "Eliminada permanentemente." : `Error: ${r.reason}`);
      continue;
    }

    if (opt === "6") {
      const s = await service.stats();
      console.log("Total:", s.total);
      console.log("Por estado:", s.byEstado);
      console.log("Por dificultad:", s.byDificultad);
      continue;
    }

    if (opt === "7") {
      console.log("1) Prioridad alta");
      console.log("2) Tareas vencidas");
      console.log("3) Tareas relacionadas a ID");
      const q = prompt("> ");
      if (q === "1") {
        const results = await service.getHighPriority();
        results.forEach(showTask);
      } else if (q === "2") {
        const results = await service.getOverdue();
        results.forEach(showTask);
      } else if (q === "3") {
        const id = prompt("ID de tarea: ");
        const results = await service.getRelated(id);
        results.forEach(showTask);
      }
      continue;
    }

    console.log("Opción no reconocida.");
  }
};

run();
