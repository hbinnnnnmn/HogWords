import type { HogwartsHouse } from '../types'

export interface HouseTheme {
  name: HogwartsHouse
  emblem: string
  primary: string
  accent: string
  gradient: string
  motto: string
  characterArt: string
}

export const HOUSES: Record<HogwartsHouse, HouseTheme> = {
  Gryffindor: {
    name: 'Gryffindor',
    emblem: '🦁',
    primary: '#740001',
    accent: '#D3A625',
    gradient: 'linear-gradient(135deg, #740001 0%, #AE0001 100%)',
    motto: 'Bravery and courage',
    characterArt: '🦁⚔️',
  },
  Slytherin: {
    name: 'Slytherin',
    emblem: '🐍',
    primary: '#1A472A',
    accent: '#AAAAAA',
    gradient: 'linear-gradient(135deg, #1A472A 0%, #2A623D 100%)',
    motto: 'Ambition and cunning',
    characterArt: '🐍🌙',
  },
  Ravenclaw: {
    name: 'Ravenclaw',
    emblem: '🦅',
    primary: '#0E1A40',
    accent: '#946B2D',
    gradient: 'linear-gradient(135deg, #0E1A40 0%, #222F5B 100%)',
    motto: 'Wit and learning',
    characterArt: '🦅📚',
  },
  Hufflepuff: {
    name: 'Hufflepuff',
    emblem: '🦡',
    primary: '#ECB939',
    accent: '#372E29',
    gradient: 'linear-gradient(135deg, #ECB939 0%, #F0C75E 100%)',
    motto: 'Loyalty and hard work',
    characterArt: '🦡🌻',
  },
}

/** Sorting Hat questionnaire — each answer maps to house affinity scores */
export const SORTING_QUESTIONS = [
  {
    id: 'q1',
    question: 'When facing a dark corridor, you would…',
    options: [
      { text: 'Charge forward boldly', house: 'Gryffindor' as HogwartsHouse },
      { text: 'Plan the safest route', house: 'Ravenclaw' as HogwartsHouse },
      { text: 'Find allies to accompany you', house: 'Hufflepuff' as HogwartsHouse },
      { text: 'Use cunning to avoid danger', house: 'Slytherin' as HogwartsHouse },
    ],
  },
  {
    id: 'q2',
    question: 'Your greatest strength is…',
    options: [
      { text: 'Courage under pressure', house: 'Gryffindor' as HogwartsHouse },
      { text: 'Clever problem-solving', house: 'Ravenclaw' as HogwartsHouse },
      { text: 'Kindness and patience', house: 'Hufflepuff' as HogwartsHouse },
      { text: 'Determination to succeed', house: 'Slytherin' as HogwartsHouse },
    ],
  },
  {
    id: 'q3',
    question: 'Which magical subject excites you most?',
    options: [
      { text: 'Defence Against the Dark Arts', house: 'Gryffindor' as HogwartsHouse },
      { text: 'Charms and Transfiguration', house: 'Ravenclaw' as HogwartsHouse },
      { text: 'Herbology', house: 'Hufflepuff' as HogwartsHouse },
      { text: 'Potions', house: 'Slytherin' as HogwartsHouse },
    ],
  },
] as const

export function resolveHouseFromAnswers(answers: HogwartsHouse[]): HogwartsHouse {
  const scores: Record<HogwartsHouse, number> = {
    Gryffindor: 0,
    Slytherin: 0,
    Ravenclaw: 0,
    Hufflepuff: 0,
  }
  for (const house of answers) scores[house] += 1
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] ??
    'Gryffindor') as HogwartsHouse
}
