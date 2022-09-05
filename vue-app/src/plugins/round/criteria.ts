export interface Criterion {
  emoji: string
  criterion: string
  description: string
}

const baseCriterion: Criterion[] = [
  {
    emoji: '⛓️',
    criterion: 'Basado en Ethereum',
    description:
        'Proyectos basados en Ethereum o tecnologías relacionadas con Ethereum (por ejemplo, investigación o herramientas de criptografía).',
  },
  {
    emoji: '🇭🇳',
    criterion: 'Con integrantes Hondureños',
    description:
        'El equipo tiene que ser parte de la comunidad hondureña, con miembros físicos trabajando en Honduras.',
  },
  {
    emoji: '😺',
    criterion: 'Gratis, Open Source, CC0 o Bien Público',
    description:
      'El código de tu proyecto debe estar disponible para cualquiera bajo una licencia de código abierto, ser gratis o tener algún bien público.',
  },
  {
    emoji: '👺',
    criterion: 'No scams, Pirámides o Multiniveles',
    description:
      'Obviamente, tu proyecto no debe poner los fondos o información de nadie en riesgo.',
  },
  {
    emoji: '🤖',
    criterion: 'No clones',
    description:
      'Si copiaste código, debes proveer un valor adicional y único al ecosistema.',
  },
  {
    emoji: '🤓',
    criterion: 'Ser Dueño del Proyecto',
    description: 'El proyecto debe ser tuyo o debes tener permiso del dueño.',
  },
  {
    emoji: '💻',
    criterion: 'No ICOs o ventas de tokens',
    description:
      'El proyecto no debe estar vendiendo ningún token a inversionistas o usuarios.',
  },
]

/**
 * Add any round-specific criteria here
 */
const ADDITIONAL_CRITERION: Criterion[] = [
  {
    emoji: '👯‍♀️',
    criterion: 'Evita el Multitasking',
    description:
      'No se aceptan proyectos con los mismos miembros de un equipo.',
  },
]

export const criteria: Criterion[] = [...baseCriterion, ...ADDITIONAL_CRITERION]
