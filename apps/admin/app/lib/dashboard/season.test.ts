import {describe, expect, it} from 'vitest';

import {foodSeason, lagosMonth, seasonSentence, seasonWindow, summariseSeason} from './season';

const food = (id: string, seasonMonths: number[] | null) => ({
  id,
  name: `Food ${id}`,
  seasonMonths,
});

describe('seasonWindow', () => {
  it('writes a run as first–last month', () => {
    expect(seasonWindow([6, 7, 8, 9, 10, 11])).toBe('Jun–Nov');
  });
  it('joins a run that crosses New Year', () => {
    expect(seasonWindow([11, 12, 1, 2])).toBe('Nov–Feb');
  });
  it('lists separate runs and single months', () => {
    expect(seasonWindow([1, 2, 6])).toBe('Jan–Feb, Jun');
  });
  it('says all year for twelve months', () => {
    expect(seasonWindow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('All year');
  });
});

describe('foodSeason', () => {
  it('has no season when none is set', () => {
    expect(foodSeason(food('a', null), 11).status).toBe('UNSET');
    expect(foodSeason(food('a', []), 11).status).toBe('UNSET');
  });
  it('treats twelve months as year-round', () => {
    expect(foodSeason(food('a', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 3).status).toBe(
      'YEAR_ROUND'
    );
  });
  it('is in season with more than two months to go', () => {
    const s = foodSeason(food('a', [8, 9, 10, 11, 12, 1]), 10);
    expect(s.status).toBe('IN_SEASON');
    expect(s.monthsLeft).toBe(4);
    expect(s.endMonth).toBe(1);
  });
  it('is leaving when the season ends this month or next', () => {
    expect(foodSeason(food('a', [8, 9, 10, 11]), 11).status).toBe('LEAVING');
    expect(foodSeason(food('a', [8, 9, 10, 11, 12]), 11).status).toBe('LEAVING');
    expect(foodSeason(food('a', [8, 9, 10, 11, 12, 1]), 11).status).toBe('IN_SEASON');
  });
  it('is coming when it starts within two months, across New Year too', () => {
    const s = foodSeason(food('a', [1, 2, 3]), 11);
    expect(s.status).toBe('COMING');
    expect(s.startsIn).toBe(2);
    expect(s.startMonth).toBe(1);
  });
  it('is out of season when the start is further away', () => {
    const s = foodSeason(food('a', [5, 6]), 11);
    expect(s.status).toBe('OUT');
    expect(s.startsIn).toBe(6);
  });
});

describe('summariseSeason', () => {
  const foods = [
    food('in', [8, 9, 10, 11, 12, 1]),
    food('leave', [9, 10, 11]),
    food('come', [12, 1]),
    food('out', [5, 6]),
    food('all', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    food('none', null),
  ];
  const summary = summariseSeason(foods, 11);

  it('sorts each food into one group', () => {
    expect(summary.inSeason.map(f => f.id)).toEqual(['in']);
    expect(summary.leaving.map(f => f.id)).toEqual(['leave']);
    expect(summary.coming.map(f => f.id)).toEqual(['come']);
    expect(summary.out.map(f => f.id)).toEqual(['out']);
    expect(summary.yearRound.map(f => f.id)).toEqual(['all']);
    expect(summary.unset.map(f => f.id)).toEqual(['none']);
    expect(summary.seasonal).toBe(4);
  });

  it('puts the food leaving soonest first', () => {
    const s = summariseSeason([food('b', [9, 10, 11, 12]), food('a', [9, 10, 11])], 11);
    expect(s.leaving.map(f => f.id)).toEqual(['a', 'b']);
  });

  it('states counts and never what prices will do', () => {
    const sentence = seasonSentence(summary);
    expect(sentence).toBe(
      '2 of 4 seasonal foods are in season; 1 ends within two months and 1 starts within two months.'
    );
    expect(sentence).not.toMatch(/price|cheap|expens/i);
  });

  it('says so when no season is set', () => {
    expect(seasonSentence(summariseSeason([food('a', null)], 11))).toContain(
      'No food has a season'
    );
  });
});

describe('lagosMonth', () => {
  it('uses Lagos time at the month boundary', () => {
    expect(lagosMonth(new Date('2026-11-30T23:30:00Z'))).toBe(12);
    expect(lagosMonth(new Date('2026-11-30T22:30:00Z'))).toBe(11);
  });
});
