/**
 * Achievement system for Intercept
 * Tracks and persists player accomplishments
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
  hidden?: boolean;
}

export interface AchievementProgress {
  unlockedAt: number;
}

export type AchievementStore = Record<string, AchievementProgress>;

// Intercept achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Skill achievements
  {
    id: 'first_intercept',
    name: 'First Blood',
    description: 'Destroy your first ICBM',
    icon: '💥',
    category: 'skill',
  },
  {
    id: 'wave_cleared',
    name: 'Wave Cleared',
    description: 'Survive your first wave',
    icon: '🌊',
    category: 'skill',
  },
  {
    id: 'perfect_wave',
    name: 'Perfect Defense',
    description: 'Complete a wave without losing any cities',
    icon: '⭐',
    category: 'skill',
  },
  {
    id: 'multi_kill',
    name: 'Chain Reaction',
    description: 'Destroy 3+ ICBMs with one explosion',
    icon: '🔥',
    category: 'skill',
  },
  {
    id: 'last_second',
    name: 'Last Second Save',
    description: 'Destroy an ICBM within 50 pixels of ground',
    icon: '😰',
    category: 'skill',
  },
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Hit an ICBM with a direct interceptor impact',
    icon: '🎯',
    category: 'skill',
  },

  // Exploration achievements
  {
    id: 'all_bases_used',
    name: 'Full Arsenal',
    description: 'Fire from all 3 missile bases in one wave',
    icon: '🚀',
    category: 'exploration',
  },
  {
    id: 'ammo_conservation',
    name: 'Conservation',
    description: 'End a wave with all bases having 5+ missiles',
    icon: '📦',
    category: 'exploration',
  },
  {
    id: 'bonus_city',
    name: 'Reinforcements',
    description: 'Earn a bonus city from score',
    icon: '🏙️',
    category: 'exploration',
  },

  // Mastery achievements
  {
    id: 'wave_5',
    name: 'Veteran',
    description: 'Reach wave 5',
    icon: '🎖️',
    category: 'mastery',
  },
  {
    id: 'wave_10',
    name: 'Commander',
    description: 'Reach wave 10',
    icon: '👑',
    category: 'mastery',
  },
  {
    id: 'score_5000',
    name: 'High Scorer',
    description: 'Score 5,000 points',
    icon: '💯',
    category: 'mastery',
  },
  {
    id: 'score_10000',
    name: 'Elite Defender',
    description: 'Score 10,000 points',
    icon: '🏆',
    category: 'mastery',
  },
  {
    id: 'score_25000',
    name: 'Legend',
    description: 'Score 25,000 points',
    icon: '🌟',
    category: 'mastery',
  },
  {
    id: 'no_loss_wave_3',
    name: 'Iron Dome',
    description: 'Reach wave 3 without losing a city',
    icon: '🛡️',
    category: 'mastery',
  },

  // Daily achievements
  {
    id: 'daily_complete',
    name: 'Daily Defender',
    description: 'Complete a daily challenge',
    icon: '📅',
    category: 'daily',
  },
  {
    id: 'daily_top_10',
    name: 'Daily Contender',
    description: 'Finish in top 10 of daily challenge',
    icon: '🔟',
    category: 'daily',
  },
  {
    id: 'daily_top_3',
    name: 'Daily Champion',
    description: 'Finish in top 3 of daily challenge',
    icon: '🥉',
    category: 'daily',
  },
  {
    id: 'daily_first',
    name: 'Daily Legend',
    description: 'Get first place in daily challenge',
    icon: '🥇',
    category: 'daily',
  },
  {
    id: 'daily_streak_3',
    name: 'Consistent',
    description: 'Complete daily challenges 3 days in a row',
    icon: '🔥',
    category: 'daily',
  },
  {
    id: 'daily_streak_7',
    name: 'Dedicated',
    description: 'Complete daily challenges 7 days in a row',
    icon: '💪',
    category: 'daily',
  },
];

const STORAGE_KEY = 'intercept_achievements';
const STREAK_KEY = 'intercept_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() {
    this.store = this.load();
    this.dailyStreak = this.loadStreak();
  }

  private load(): AchievementStore {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {
      // localStorage may be unavailable
    }
  }

  private loadStreak(): { lastDate: string; count: number } {
    try {
      const data = localStorage.getItem(STREAK_KEY);
      return data ? JSON.parse(data) : { lastDate: '', count: 0 };
    } catch {
      return { lastDate: '', count: 0 };
    }
  }

  private saveStreak(): void {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak));
    } catch {
      // localStorage may be unavailable
    }
  }

  isUnlocked(id: string): boolean {
    return id in this.store;
  }

  getProgress(): AchievementStore {
    return { ...this.store };
  }

  getUnlockedCount(): number {
    return Object.keys(this.store).length;
  }

  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) {
      return null;
    }

    const achievement = this.getAchievement(id);
    if (!achievement) {
      return null;
    }

    this.store[id] = { unlockedAt: Date.now() };
    this.save();
    return achievement;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    const unlocked: Achievement[] = [];
    for (const id of ids) {
      const achievement = this.unlock(id);
      if (achievement) {
        unlocked.push(achievement);
      }
    }
    return unlocked;
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];

    const daily = this.unlock('daily_complete');
    if (daily) unlocked.push(daily);

    if (rank <= 10) {
      const top10 = this.unlock('daily_top_10');
      if (top10) unlocked.push(top10);
    }
    if (rank <= 3) {
      const top3 = this.unlock('daily_top_3');
      if (top3) unlocked.push(top3);
    }
    if (rank === 1) {
      const first = this.unlock('daily_first');
      if (first) unlocked.push(first);
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    if (this.dailyStreak.lastDate === yesterday) {
      this.dailyStreak.count++;
    } else if (this.dailyStreak.lastDate !== today) {
      this.dailyStreak.count = 1;
    }
    this.dailyStreak.lastDate = today;
    this.saveStreak();

    if (this.dailyStreak.count >= 3) {
      const streak3 = this.unlock('daily_streak_3');
      if (streak3) unlocked.push(streak3);
    }
    if (this.dailyStreak.count >= 7) {
      const streak7 = this.unlock('daily_streak_7');
      if (streak7) unlocked.push(streak7);
    }

    return unlocked;
  }

  reset(): void {
    this.store = {};
    this.dailyStreak = { lastDate: '', count: 0 };
    this.save();
    this.saveStreak();
  }
}

let instance: AchievementManager | null = null;

export function getAchievementManager(): AchievementManager {
  if (!instance) {
    instance = new AchievementManager();
  }
  return instance;
}
