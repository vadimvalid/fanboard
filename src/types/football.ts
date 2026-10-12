export type CompetitionType = 'LEAGUE' | 'CUP'
export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'SUSPENDED'
  | 'CANCELLED'
export type PlayerPosition = 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence'
export type MatchWinner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW'

export interface Competition {
  id: number
  name: string
  code: string
  type: CompetitionType
  emblem: string | null
}

export interface TeamRef {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string | null
}

export interface Player {
  id: number
  name: string
  position: PlayerPosition | null
  dateOfBirth: string | null
  nationality: string | null
}

export interface Team extends TeamRef {
  venue: string | null
  founded: number | null
  clubColors: string | null
  coach: { name: string }
  squad: Player[]
  runningCompetitions: Competition[]
}

export interface Score {
  winner: MatchWinner | null
  fullTime: {
    home: number | null
    away: number | null
  }
}

export interface Match {
  id: number
  utcDate: string
  status: MatchStatus
  matchday: number | null
  competition: Competition
  homeTeam: TeamRef
  awayTeam: TeamRef
  score: Score
}

export interface StandingRow {
  position: number
  team: TeamRef
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface CompetitionsResponse {
  competitions: Competition[]
}

export interface CompetitionTeamsResponse {
  teams: Team[]
  competition: Competition
}

export interface StandingsResponse {
  competition: Competition
  standings: {
    type: string
    table: StandingRow[]
  }[]
}

export interface MatchesResponse {
  matches: Match[]
}
