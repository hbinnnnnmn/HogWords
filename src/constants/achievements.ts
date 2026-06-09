import type { AchievementId } from '../types'

export interface AchievementDef {
  id: AchievementId
  name: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_spell_cast',
    name: 'First Spell Cast',
    description: 'Successfully pronounce a word via Incantation Mode',
    icon: '✨',
  },
  {
    id: 'first_spell',
    name: 'First Spell Mastered',
    description: 'Memorize 10 vocabulary words',
    icon: '📖',
  },
  {
    id: 'wizard_beginner',
    name: 'Apprentice Wizard',
    description: 'Reach Level 5',
    icon: '🎓',
  },
  {
    id: 'word_wizard',
    name: 'Word Wizard',
    description: 'Memorize 50 vocabulary words',
    icon: '📜',
  },
  {
    id: 'unyielding',
    name: 'Unyielding Dedication',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
  },
  {
    id: 'hundred_spells',
    name: 'Master of a Hundred Spells',
    description: 'Memorize 100 vocabulary words',
    icon: '💫',
  },
  {
    id: 'order_of_merlin',
    name: 'Order of Merlin, 3rd Class',
    description: 'Complete 10 daily Spell Duels',
    icon: '🏅',
  },
  {
    id: 'duel_champion',
    name: 'Duel Champion',
    description: 'Win a perfect 5/5 Spell Duel',
    icon: '⚔️',
  },
]

export const ADMIN_PASSWORD = 'lumos'
