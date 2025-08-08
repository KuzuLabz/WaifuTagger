import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InferenceTag, Rank } from '../types';
import { rankExp } from '../constants';

const config = {
	baseExp: 1200,
	rankExp: rankExp,
};

export type LevelInfo = {
	level: number;
	xp: number;
	levelXpCap: number;
};

export type StatsState = {
	totalInfers: number;
	levelInfo: LevelInfo;
	ranksInferred: Record<Rank, number>;
	isEnabled: boolean;
};

export type StatsActions = {
	addXp: (rank: Rank, rating?: InferenceTag[]) => boolean;
	resetLevels: () => void;
	resetStats: () => void;
	setIsEnabled: (isToggled: boolean) => void;
};

const initialState: StatsState = {
	isEnabled: true,
	totalInfers: 0,
	levelInfo: {
		level: 1,
		xp: 0,
		levelXpCap: config.baseExp,
	},
	ranksInferred: {
		S: 0,
		A: 0,
		B: 0,
		C: 0,
		D: 0,
		E: 0,
		F: 0,
	},
};

const getLevelTotalXp = (level: number) => {
	return config.baseExp * level;
};

export const useStatsStore = create<StatsState & StatsActions>()(
	persist(
		(set, get) => ({
			...initialState,
			addXp(rank) {
				if (!get().isEnabled) {
					return false;
				}
				const levelInfo = get().levelInfo;
				const ranksInferred = get().ranksInferred;
				ranksInferred[rank] += 1;
				const totalInfers = (get().totalInfers += 1);
				levelInfo.xp += config.rankExp[rank];
				const neededXp = getLevelTotalXp(levelInfo.level);
				let isLeveledUp = false;
				if (levelInfo.xp >= neededXp) {
					levelInfo.xp -= neededXp;
					levelInfo.level += 1;
					levelInfo.levelXpCap = getLevelTotalXp(levelInfo.level);
					isLeveledUp = true;
				}
				set({ levelInfo, totalInfers, ranksInferred });
				return isLeveledUp;
			},
			resetLevels() {
				set({ levelInfo: initialState.levelInfo });
			},
			resetStats() {
				set({
					totalInfers: initialState.totalInfers,
					ranksInferred: initialState.ranksInferred,
				});
			},
			setIsEnabled(isToggled) {
				set((state) => ({ ...state, isEnabled: isToggled }));
			},
		}),
		{
			name: 'stats-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
