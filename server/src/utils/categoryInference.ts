import { AnySleepData, WhoopSleepData, SleepSession } from '../types';
import { Category } from '../promptTemplates/veoPromptTemplate';

function isWhoop(data: AnySleepData): data is WhoopSleepData {
  return (data as WhoopSleepData).score !== undefined;
}

function metricsFrom(data: AnySleepData) {
  if (isWhoop(data)) {
    const s = data.score;
    const sum = s?.stage_summary;
    return {
      performance: s?.sleep_performance_percentage,
      wakeUps: sum?.disturbance_count ?? 0,
      respiratory: s?.respiratory_rate,
      start: data.start,
    };
  }
  const sess = data as SleepSession;
  return {
    performance: { poor: 60, fair: 75, good: 85, excellent: 95 }[sess.sleepQuality] ?? 75,
    wakeUps: sess.wakeUps,
    respiratory: Math.round((sess.heartRateData.averageBPM || 60) / 4),
    start: `${sess.date}T${sess.startTime}Z`,
  };
}

export function inferCategoryFromMetrics(data: AnySleepData): Category {
  const m = metricsFrom(data);

  // Health-oriented if poor performance or elevated respiration or many wake ups
  if ((m.performance ?? 100) < 65) return 'Health';
  if ((m.respiratory ?? 0) > 18) return 'Health';
  if ((m.wakeUps ?? 0) >= 4) return 'Danger';

  // Time-based heuristics
  try {
    const hour = new Date(m.start || Date.now()).getUTCHours();
    if (hour >= 1 && hour < 3) return 'Career';
    if (hour >= 3 && hour < 5) return 'Family';
    if (hour >= 5 && hour < 7) return 'Travel';
  } catch {
    // ignore
  }

  // Balanced defaults
  return 'Health';
}


