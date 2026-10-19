import type { Match, MatchResult } from '@/types/football'

const matchDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function getMatchResult(match: Match, teamId: number): MatchResult | null {
  if (match.score.winner === null) {
    return null
  }

  if (match.score.winner === 'DRAW') {
    return 'D'
  }

  if (match.score.winner === 'HOME_TEAM') {
    return match.homeTeam.id === teamId ? 'W' : 'L'
  }

  return match.awayTeam.id === teamId ? 'W' : 'L'
}

export function formatMatchDate(utcDate: string): string {
  return matchDateFormatter.format(new Date(utcDate))
}
