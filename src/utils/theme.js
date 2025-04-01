import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseCodeforces, parseLeetCode, parseCodeChef, parseHackerRank, parseDevpost, parseMLH } from '../utils/helpers';

const CACHE_DURATION = 15 * 60 * 1000;

const fetchWithCache = async (key, fetchFn) => {
  try {
    const now = Date.now();
    const cached = JSON.parse(await AsyncStorage.getItem(key) || '{}');
    if (cached.timestamp && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    const freshData = await fetchFn();
    await AsyncStorage.setItem(key, JSON.stringify({ timestamp: now, data: freshData }));
    return freshData;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }
};

export const fetchAllContests = async () => {
  try {
    const [contests, hackathons] = await Promise.all([
      fetchWithCache('contests', async () => {
        const cf = await axios.get('https://codeforces.com/api/contest.list');
        const lc = await axios.get('https://leetcode.com/contest/api/list');
        const cc = await axios.get('https://www.codechef.com/api/list/contests/all');
        const hr = await axios.get('https://www.hackerrank.com/rest/contests/upcoming');
        
        return [
          ...parseCodeforces(cf.data.result),
          ...parseLeetCode(lc.data.contests.upcoming_contests),
          ...parseCodeChef(cc.data),
          ...parseHackerRank(hr.data.models)
        ];
      }),
      fetchWithCache('hackathons', async () => {
        const dp = await axios.get('https://devpost.com/api/hackathons', {
          params: { status: 'upcoming', order_by: 'recently-added' }
        });
        const mlh = await axios.get('https://mlh.io/api/seasons/upcoming');
        
        return [
          ...parseDevpost(dp.data.hackathons),
          ...parseMLH(mlh.data.seasons.flatMap(season => season.events))
        ];
      })
    ]);
    
    return { contests, hackathons };
  } catch (error) {
    console.error('Error fetching all contests:', error);
    return { contests: [], hackathons: [] };
  }
};