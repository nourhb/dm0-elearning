'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
  animate?: boolean;
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
};

const progressColorVariants = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export function AnimatedProgressCard({
  title,
  value,
  maxValue,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  className,
  animate = true,
}: AnimatedProgressCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('group', className)}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-16 translate-x-16',
          `bg-gradient-to-br ${colorVariants[color]}`
        )} />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-3 rounded-xl bg-gradient-to-br',
                colorVariants[color]
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </CardTitle>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {trend && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1"
                >
                  <Badge
                    variant={trend.isPositive ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </Badge>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                {displayValue.toLocaleString()}
              </motion.div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                of {maxValue.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', progressColorVariants[color])}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: animate ? 1.5 : 0,
                      ease: "easeOut"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
}
