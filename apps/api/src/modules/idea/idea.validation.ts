import * as z from 'zod';

/**
 * Schema for validating the structure of an individual idea.
 * Each idea has an id, color, content, and priority.
 */
const ideaSchema = z.object({
  id: z.string("L'id est requis"),
  color: z
    .string('la couleur est requise')
    .regex(
      /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/,
      'Doit être une couleur hexadécimale valide (ex: #ddd ou #ddd6fe)'
    ),
  content: z.string('Le contenu est requis'),
  priority: z.string('La priorité est requise'),
});

/**
 * Ideas schema for validating the structure of ideas data.
 * The main object contains three arrays: todo, progress, and done.
 */
export const IdeasSchema = z.object({
  todo: z.array(ideaSchema, 'Le tableau "todo" doit être un tableau d\'idées'),
  progress: z.array(
    ideaSchema,
    'Le tableau "progress" doit être un tableau d\'idées'
  ),
  done: z.array(ideaSchema, 'Le tableau "done" doit être un tableau d\'idées'),
});
