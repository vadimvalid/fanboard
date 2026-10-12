import type {
  Competition,
  CompetitionTeamsResponse,
  CompetitionsResponse,
  Match,
  MatchesResponse,
  StandingRow,
  StandingsResponse,
  Team,
} from '@/types/football'

const BASE_URL = '/api/football'

export class FootballApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'FootballApiError'
    this.status = status
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  if (response.status === 429) {
    const resetSeconds = response.headers.get('X-RequestCounter-Reset')
    return resetSeconds
      ? `Превышен лимит запросов, повторите через ${resetSeconds} с`
      : 'Превышен лимит запросов, подождите минуту'
  }

  // The body may not be JSON, e.g. a 502 HTML page from the dev proxy.
  try {
    const body: { message?: string } = await response.json()
    return body.message ?? response.statusText
  } catch {
    return response.statusText
  }
}

async function request<T>(path: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`)
  } catch {
    throw new FootballApiError(0, 'Нет соединения с сервером')
  }

  if (!response.ok) {
    throw new FootballApiError(response.status, await getErrorMessage(response))
  }

  return response.json() as Promise<T>
}

export async function getCompetitions(): Promise<Competition[]> {
  const data = await request<CompetitionsResponse>('/competitions')
  return data.competitions
}

export async function getCompetitionTeams(code: string): Promise<Team[]> {
  const data = await request<CompetitionTeamsResponse>(`/competitions/${code}/teams`)
  return data.teams
}

export async function getStandings(code: string): Promise<StandingRow[]> {
  const data = await request<StandingsResponse>(`/competitions/${code}/standings`)
  const total = data.standings.find((standing) => standing.type === 'TOTAL')
  return total?.table ?? []
}

export function getTeam(id: number): Promise<Team> {
  return request<Team>(`/teams/${id}`)
}

export async function getTeamMatches(id: number): Promise<Match[]> {
  const data = await request<MatchesResponse>(`/teams/${id}/matches`)
  return data.matches
}
