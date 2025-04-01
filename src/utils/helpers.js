// src/utils/helpers.js
import { formatDistanceToNow } from 'date-fns';

// Parse Codeforces contests
export const parseCodeforces = (contests) => {
  return contests
    .filter(contest => contest.phase === "BEFORE")
    .slice(0, 10) // Limit to 10 upcoming contests
    .map(contest => ({
      id: `cf-${contest.id}`,
      name: contest.name,
      url: `https://codeforces.com/contest/${contest.id}`,
      startTime: contest.startTimeSeconds * 1000,
      endTime: (contest.startTimeSeconds + contest.durationSeconds) * 1000,
      platform: 'Codeforces',
      duration: contest.durationSeconds * 1000,
      timeUntil: formatDistanceToNow(new Date(contest.startTimeSeconds * 1000), { addSuffix: true }),
      registrationOpen: true,
      type: 'contest'
    }));
};

// Parse LeetCode contests
export const parseLeetCode = (contests) => {
  return contests.map(contest => ({
    id: `lc-${contest.titleSlug}`,
    name: contest.title,
    url: `https://leetcode.com/contest/${contest.titleSlug}`,
    startTime: contest.startTime * 1000,
    endTime: (contest.startTime + contest.duration) * 1000,
    platform: 'LeetCode',
    duration: contest.duration * 1000,
    timeUntil: formatDistanceToNow(new Date(contest.startTime * 1000), { addSuffix: true }),
    registrationOpen: true,
    description: contest.description,
    type: 'contest'
  }));
};

// Parse CodeChef contests
export const parseCodeChef = (contests) => {
  return contests.map(contest => ({
    id: `cc-${contest.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: contest.name,
    url: contest.url,
    startTime: contest.startTime,
    endTime: contest.endTime,
    platform: 'CodeChef',
    duration: contest.endTime - contest.startTime,
    timeUntil: formatDistanceToNow(new Date(contest.startTime), { addSuffix: true }),
    registrationOpen: true,
    type: 'contest'
  }));
};

// Parse HackerRank contests
export const parseHackerRank = (contests) => {
  return contests.map(contest => ({
    id: `hr-${contest.slug}`,
    name: contest.name,
    url: `https://www.hackerrank.com/contests/${contest.slug}`,
    startTime: new Date(contest.start_time).getTime(),
    endTime: new Date(contest.end_time).getTime(),
    platform: 'HackerRank',
    duration: new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime(),
    timeUntil: formatDistanceToNow(new Date(contest.start_time), { addSuffix: true }),
    registrationOpen: true,
    type: 'contest'
  }));
};

// Parse Devpost hackathons
export const parseDevpost = (hackathons) => {
  return hackathons.map(hackathon => ({
    id: `dp-${hackathon.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: hackathon.name,
    url: hackathon.url,
    startTime: hackathon.startTime,
    endTime: hackathon.endTime,
    platform: 'Devpost',
    duration: hackathon.endTime - hackathon.startTime,
    timeUntil: formatDistanceToNow(new Date(hackathon.startTime), { addSuffix: true }),
    registrationOpen: true,
    type: 'hackathon'
  }));
};

// Parse MLH hackathons
export const parseMLH = (hackathons) => {
  return hackathons.map(hackathon => ({
    id: `mlh-${hackathon.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: hackathon.name,
    url: hackathon.url,
    startTime: hackathon.startTime,
    endTime: hackathon.endTime,
    platform: 'MLH',
    duration: hackathon.endTime - hackathon.startTime,
    timeUntil: formatDistanceToNow(new Date(hackathon.startTime), { addSuffix: true }),
    registrationOpen: true,
    type: 'hackathon'
  }));
};

// Get platform color
export const getPlatformColor = (platform) => {
  const colors = {
    'Codeforces': '#1890ff',
    'LeetCode': '#f5a623',
    'CodeChef': '#5c4033',
    'HackerRank': '#2ec866',
    'Devpost': '#003e54',
    'MLH': '#e73427',
    'default': '#6c757d'
  };
  
  return colors[platform] || colors.default;
};

// Format duration
export const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

// Format date and time
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};