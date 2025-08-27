'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Star, Trophy, Medal, Award, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  category: 'learning' | 'teaching' | 'community' | 'milestone' | 'special';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onClick?: () => void;
  className?: string;
}

const categoryIcons = {
  learning: Star,
  teaching: Trophy,
  community: Medal,
  milestone: Award,
  special: Crown,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-yellow-500',
};

const rarityGlows = {
  common: 'shadow-gray-400/20',
  rare: 'shadow-blue-400/30',
  epic: 'shadow-purple-400/40',
  legendary: 'shadow-yellow-400/50',
};

export function AchievementBadge({
  id,
  title,
  description,
  icon,
  category,
  points,
  isUnlocked,
  unlockedAt,
  rarity = 'common',
  onClick,
  className,
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = icon || categoryIcons[category];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          'relative cursor-pointer transition-all duration-300 border-0',
          isUnlocked
            ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl'
            : 'bg-gray-100 dark:bg-gray-800 opacity-60',
          rarity !== 'common' && isUnlocked && `shadow-lg ${rarityGlows[rarity]}`
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'relative p-3 rounded-xl transition-all duration-300',
              isUnlocked
                ? `bg-gradient-to-br ${rarityColors[rarity]}`
                : 'bg-gray-300 dark:bg-gray-600'
            )}>
              <IconComponent className={cn(
                'h-6 w-6 transition-all duration-300',
                isUnlocked ? 'text-white' : 'text-gray-500'
              )} />
              
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute -top-1 -right-1"
                >
                  <Zap className="h-4 w-4 text-yellow-400" />
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  'font-semibold text-sm truncate',
                  isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                )}>
                  {title}
                </h3>
                <Badge
                  variant={isUnlocked ? 'default' : 'secondary'}
                  className="text-xs ml-2"
                >
                  {points} pts
                </Badge>
              </div>
              
              <p className={cn(
                'text-xs mt-1 line-clamp-2',
                isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'
              )}>
                {description}
              </p>

              {isUnlocked && unlockedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Unlocked {unlockedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Rarity indicator */}
          {rarity !== 'common' && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs border-0',
                  rarity === 'rare' && 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
                  rarity === 'epic' && 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
                  rarity === 'legendary' && 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                )}
              >
                {rarity}
              </Badge>
            </div>
          )}
        </CardContent>

        {/* Hover effects */}
        <AnimatePresence>
          {isHovered && isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Lock overlay for unachieved badges */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
              <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Achievement Grid Component
interface AchievementGridProps {
  achievements: AchievementBadgeProps[];
  className?: string;
}

export function AchievementGrid({ achievements, className }: AchievementGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          {...achievement}
        />
      ))}
    </div>
  );
}

// Achievement Progress Component
interface AchievementProgressProps {
  unlocked: number;
  total: number;
  className?: string;
}

export function AchievementProgress({ unlocked, total, className }: AchievementProgressProps) {
  const percentage = (unlocked / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">Achievements</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {unlocked}/{total}
        </span>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        {percentage.toFixed(0)}% complete
      </p>
    </div>
  );
}
