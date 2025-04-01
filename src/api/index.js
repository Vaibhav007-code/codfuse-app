// src/api/index.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseCodeforces, parseLeetCode, parseCodeChef, parseDevpost, parseMLH } from '../utils/helpers';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

const fetchWithCache = async (key, fetchFn) => {
  try {
    const now = Date.now();
    const cachedString = await AsyncStorage.getItem(key);
    const cached = cachedString ? JSON.parse(cachedString) : {};

    if (cached.timestamp && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const freshData = await fetchFn();
    await AsyncStorage.setItem(key, JSON.stringify({
      timestamp: now,
      data: freshData
    }));
    return freshData;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }
};

export const fetchAllContests = async () => {
  try {
    const results = await Promise.allSettled([
      fetchCodeforces(),
      fetchLeetCode(),
      fetchCodeChef(),
      fetchHackerRank(),
      fetchHackathons()
    ]);

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .sort((a, b) => a.startTime - b.startTime);
  } catch (error) {
    console.error('Error fetching all contests:', error);
    return [];
  }
};

const fetchCodeforces = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    return parseCodeforces(response.data.result);
  } catch (error) {
    console.error('Codeforces API error:', error);
    return [];
  }
};

const fetchLeetCode = async () => {
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        query: `
          {
            allContests {
              title
              titleSlug
              startTime
              duration
              description
            }
          }
        `
      })
    });
    
    const contests = response.data?.data?.allContests || [];
    return parseLeetCode(contests.filter(contest => 
      contest.startTime && new Date(contest.startTime * 1000) > new Date()
    ));
  } catch (error) {
    console.error('LeetCode API error:', error);
    return [];
  }
};

const fetchCodeChef = async () => {
  try {
    const mockData = [
      {
        name: 'CodeChef Starters 100',
        url: 'https://www.codechef.com/START100',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).getTime(),
        platform: 'CodeChef'
      },
      {
        name: 'CodeChef Long Challenge April',
        url: 'https://www.codechef.com/APRIL25',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'CodeChef'
      }
    ];
    
    return parseCodeChef(mockData);
  } catch (error) {
    console.error('CodeChef API error:', error);
    return [];
  }
};

const fetchHackerRank = async () => {
  try {
    // First try to get data from the HackerRank API
    const response = await axios.get('https://www.hackerrank.com/rest/contests/upcoming?limit=100');
    
    if (response.data && Array.isArray(response.data.models)) {
      const validContests = response.data.models
        .filter(contest => {
          try {
            if (!contest.start_time || !contest.end_time) return false;
            const startDate = new Date(contest.start_time);
            const endDate = new Date(contest.end_time);
            return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
          } catch (e) {
            return false;
          }
        })
        .map(contest => ({
          name: contest.name,
          url: `https://www.hackerrank.com/contests/${contest.slug}`,
          startTime: new Date(contest.start_time).getTime(),
          endTime: new Date(contest.end_time).getTime(),
          platform: 'HackerRank'
        }));
      
      if (validContests.length > 0) {
        return validContests;
      }
    }
    
    // Fallback to mock data if API fails or returns invalid data
    const now = Date.now();
    return [
      {
        name: 'HackerRank Week of Code 37',
        url: 'https://www.hackerrank.com/contests/weekofcode37',
        startTime: new Date(now + 3 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 10 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'HackerRank'
      },
      {
        name: 'HackerRank Hour Rank 31',
        url: 'https://www.hackerrank.com/contests/hourrank31',
        startTime: new Date(now + 7 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).getTime(),
        platform: 'HackerRank'
      }
    ];
  } catch (error) {
    console.error('HackerRank API error:', error);
    return [];
  }
};

const fetchHackathons = async () => {
  try {
    const [devpostResults, mlhResults] = await Promise.all([
      fetchDevpost(),
      fetchMLH()
    ]);
    return [...devpostResults, ...mlhResults];
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return [];
  }
};

const fetchDevpost = async () => {
  try {
    const now = Date.now();
    const mockData = [
      {
        name: 'AI Hackathon 2025',
        url: 'https://devpost.com/hackathons/ai-hackathon-2025',
        startTime: new Date(now + 10 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 12 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'Devpost'
      },
      {
        name: 'Mobile App Innovation Challenge',
        url: 'https://devpost.com/hackathons/mobile-app-innovation',
        startTime: new Date(now + 15 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 17 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'Devpost'
      }
    ];
    return parseDevpost(mockData);
  } catch (error) {
    console.error('Devpost API error:', error);
    return [];
  }
};

const fetchMLH = async () => {
  try {
    const now = Date.now();
    const mockData = [
      {
        name: 'HackTech 2025',
        url: 'https://mlh.io/events/hacktech-2025',
        startTime: new Date(now + 20 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 22 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'MLH'
      },
      {
        name: 'HackNYU 2025',
        url: 'https://mlh.io/events/hacknyu-2025',
        startTime: new Date(now + 25 * 24 * 60 * 60 * 1000).getTime(),
        endTime: new Date(now + 27 * 24 * 60 * 60 * 1000).getTime(),
        platform: 'MLH'
      }
    ];
    return parseMLH(mockData);
  } catch (error) {
    console.error('MLH API error:', error);
    return [];
  }
};

export const setupAutoRefresh = (callback, interval = 15 * 60 * 1000) => {
  fetchAllContests().then(callback);
  const refreshTimer = setInterval(() => {
    fetchAllContests().then(callback);
  }, interval);
  return () => clearInterval(refreshTimer);
};

export const fetchCachedData = async () => {
  try {
    return await fetchWithCache('all_contests', fetchAllContests);
  } catch (error) {
    console.error('Error fetching cached data:', error);
    return [];
  }
};

export {
  fetchCodeforces,
  fetchLeetCode,
  fetchCodeChef,
  fetchHackerRank,
  fetchHackathons,
  fetchDevpost,
  fetchMLH
};