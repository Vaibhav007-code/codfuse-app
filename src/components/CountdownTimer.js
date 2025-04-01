// src/components/CountdownTimer.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ targetTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  function calculateTimeLeft() {
    const difference = new Date(targetTime) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isLive: false
    };
  }
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetTime]);
  
  if (timeLeft.isLive) {
    return (
      <View style={[styles.container, styles.liveContainer]}>
        <Text style={styles.liveText}>LIVE NOW</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {timeLeft.days > 0 && (
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{timeLeft.days}</Text>
          <Text style={styles.timeLabel}>d</Text>
        </View>
      )}
      
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeLeft.hours).padStart(2, '0')}</Text>
        <Text style={styles.timeLabel}>h</Text>
      </View>
      
      <Text style={styles.timeSeparator}>:</Text>
      
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
        <Text style={styles.timeLabel}>m</Text>
      </View>
      
      <Text style={styles.timeSeparator}>:</Text>
      
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
        <Text style={styles.timeLabel}>s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeUnit: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 1,
    marginRight: 2,
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 2,
  },
  liveContainer: {
    backgroundColor: '#ff4d4f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default CountdownTimer;