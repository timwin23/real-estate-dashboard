// app/components/dashboard/PersonalAchievements.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Target, Trophy, Star, Lock, Crown, MessageSquare, Gauge } from 'lucide-react';
import { fetchAchievements, type Achievement, type Goal, type AchievementsData, type TierType, type CategoryType } from './sheets';

interface Props {
    salesData: any[];
    marketingData: any[];
}

// Icon mapping
const ICONS: { [key: string]: React.ComponentType<any> | undefined } = {
    'message': MessageSquare,
    'target': Target,
    'trophy': Trophy,
    'star': Star,
    'crown': Crown,
    'gauge': Gauge
};

// Tier colors
const TIER_COLORS: { [key in TierType]: string } = {
    'bronze': 'text-orange-400',
    'silver': 'text-gray-300',
    'gold': 'text-yellow-400',
    'none': 'text-white'
};

const PersonalAchievements = ({ salesData, marketingData }: Props) => {
    const [achievements, setAchievements] = useState<AchievementsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAchievements() {
            const data = await fetchAchievements();
            if (data) {
                setAchievements(data);
            }
            setLoading(false);
        }
        loadAchievements();
    }, []);

    if (loading || !achievements) {
        return <div className="text-gray-400">Loading achievements...</div>;
    }

    const { activeGoal, completedAchievements } = achievements;

    // Group completed achievements by category
    const groupedAchievements = completedAchievements.reduce((acc: { [key in CategoryType]: Goal[] }, achievement: Goal) => {
        const category = achievement.category as CategoryType;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
    }, { sales: [], marketing: [] } as { [key in CategoryType]: Goal[] });

    return (
        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 h-[400px] overflow-y-auto">
            {/* Active Goal Section */}
            {activeGoal && (
                <div className="mb-6">
                    <h3 className="text-lg text-red-500 font-bold mb-2">Current Goal</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-red-500/30">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-sm ${TIER_COLORS[activeGoal.tier]}`}>
                                    {activeGoal.category.toUpperCase()} • {activeGoal.tier.toUpperCase()}
                                </span>
                                <div className="font-bold text-white">{activeGoal.title}</div>
                                <div className="text-sm text-gray-400">{activeGoal.description}</div>
                            </div>
                            <div className="text-sm text-red-400 font-bold">{activeGoal.trait}</div>
                        </div>
                        <div className="mt-2">
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(activeGoal.progress / activeGoal.target) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{activeGoal.progress} / {activeGoal.target}</span>
                                <span>{Math.round((activeGoal.progress / activeGoal.target) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-red-500 font-bold">Achievements Unlocked</h3>
                    <span className="text-sm text-gray-400">
                        {completedAchievements.length} Total
                    </span>
                </div>

                /* Achievement Categories */
}
{
  Object.entries(groupedAchievements).map(([category, achievements]) => (
    <div key={category} className="mb-4">
      <h4 className="text-sm text-gray-400 mb-2">
        {category.toUpperCase() + ` (${achievements.length})`}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map(achievement => {
          const IconComponent = achievement.icon
            ? ICONS[achievement.icon] || Trophy
            : Trophy;
          return (
            <div
              key={achievement.id}
              className="bg-gray-800 rounded-lg p-3 border border-red-500/20"
            >
              <div className="flex items-center gap-2">
                <IconComponent
                  className={`w-4 h-4 ${TIER_COLORS[achievement.tier]}`}
                />
                <div>
                  <div className="text-sm font-bold text-white">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-red-400">
                    {achievement.trait}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ));
}


export default PersonalAchievements;