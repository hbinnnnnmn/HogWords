/** Predefined wand combinations for the Sorting Hat ceremony */
export const WAND_CORES = [
  'Phoenix feather',
  'Dragon heartstring',
  'Unicorn hair',
  'Thestral tail hair',
] as const

export const WAND_WOODS = [
  'Holly',
  'Yew',
  'Elder',
  'Vine',
  'Oak',
  'Willow',
  'Cherry',
] as const

export const WAND_LENGTHS = ['9', '10', '11', '12', '13', '14'] as const

export function buildWandDescription(
  wood: string,
  core: string,
  length: string,
): string {
  return `${wood}, ${core}, ${length} inches`
}

export function randomWand(): string {
  const wood = WAND_WOODS[Math.floor(Math.random() * WAND_WOODS.length)]
  const core = WAND_CORES[Math.floor(Math.random() * WAND_CORES.length)]
  const length = WAND_LENGTHS[Math.floor(Math.random() * WAND_LENGTHS.length)]
  return buildWandDescription(wood, core, length)
}
