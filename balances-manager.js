import fs from 'fs';
import path from 'path';

const BALANCE_FILE = path.join(process.cwd(), 'balances.json');

export function readBalances() {
  try {
    const raw = fs.readFileSync(BALANCE_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function writeBalances(data) {
  try {
    fs.writeFileSync(BALANCE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write balances:', e);
  }
}

export function getUser(balances, userId) {
  const user = balances[userId];
  if (!user) return {
    balance: 0,
    lastDaily: 0,
    blackjackWins: 0,
    blackjackLosses: 0,
    guessingWins: 0,
    guessingLosses: 0,
  };

  return {
    balance: user.balance || 0,
    lastDaily: user.lastDaily || 0,
    blackjackWins: user.blackjackWins || 0,
    blackjackLosses: user.blackjackLosses || 0,
    guessingWins: user.guessingWins || 0,
    guessingLosses: user.guessingLosses || 0,
  };
}

export function ensureUser(balances, userId) {
  const user = balances[userId] || {};
  user.balance = user.balance || 0;
  user.lastDaily = user.lastDaily || 0;
  user.blackjackWins = user.blackjackWins || 0;
  user.blackjackLosses = user.blackjackLosses || 0;
  user.guessingWins = user.guessingWins || 0;
  user.guessingLosses = user.guessingLosses || 0;
  balances[userId] = user;
  return user;
}

export function incrementStat(userId, stat, delta = 1) {
  const balances = readBalances();
  ensureUser(balances, userId);
  if (!balances[userId][stat]) balances[userId][stat] = 0;
  balances[userId][stat] += delta;
  writeBalances(balances);
  return balances[userId];
}

export function incrementWin(userId, game) {
  if (game === 'blackjack') return incrementStat(userId, 'blackjackWins', 1);
  if (game === 'guessing') return incrementStat(userId, 'guessingWins', 1);
  return null;
}

export function incrementLoss(userId, game) {
  if (game === 'blackjack') return incrementStat(userId, 'blackjackLosses', 1);
  if (game === 'guessing') return incrementStat(userId, 'guessingLosses', 1);
  return null;
}
