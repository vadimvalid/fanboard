import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCompetitions,
  getCompetitionTeams,
  getStandings,
  getTeam,
  getTeamMatches,
} from '@/services/footballApi'
import type { Competition, Match, StandingRow, Team } from '@/types/football'

const SELECTED_TEAM_KEY = 'fanboard:selectedTeamId'

function readSelectedTeamId(): number | null {
  try {
    const storedValue = localStorage.getItem(SELECTED_TEAM_KEY)

    if (!storedValue) {
      return null
    }

    const parsedValue = Number(storedValue)
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
  } catch (error) {
    console.error('Error reading selected team ID from localStorage:', error)
    return null
  }
}

const LONG_TTL = 60 * 60 * 1000
const SHORT_TTL = 5 * 60 * 1000

export const useTeamStore = defineStore('team', () => {
  const selectedTeamId = ref<number | null>(readSelectedTeamId())
  const cache = new Map<string, { data: unknown; expiresAt: number }>()
  const inFlight = new Map<string, Promise<unknown>>()

  function selectTeam(id: number) {
    selectedTeamId.value = id
    try {
      localStorage.setItem(SELECTED_TEAM_KEY, id.toString())
    } catch (error) {
      console.error('Error saving selected team ID to localStorage:', error)
    }
  }

  function clearTeam() {
    selectedTeamId.value = null
    try {
      localStorage.removeItem(SELECTED_TEAM_KEY)
    } catch (error) {
      console.error('Error removing selected team ID from localStorage:', error)
    }
  }

  async function cached<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    const now = Date.now()
    const entry = cache.get(key)

    if (entry && entry.expiresAt > now) {
      return entry.data as T
    }

    const pending = inFlight.get(key)

    if (pending) {
      return pending as Promise<T>
    }

    const fetchPromise = fetcher()
    inFlight.set(key, fetchPromise)

    try {
      const data = await fetchPromise
      cache.set(key, { data, expiresAt: Date.now() + ttl })
      return data
    } finally {
      inFlight.delete(key)
    }
  }

  function fetchTeam(id: number): Promise<Team> {
    return cached(`team:${id}`, () => getTeam(id), LONG_TTL)
  }

  function fetchTeamMatches(id: number): Promise<Match[]> {
    return cached(`team:${id}:matches`, () => getTeamMatches(id), SHORT_TTL)
  }

  function fetchStandings(code: string): Promise<StandingRow[]> {
    return cached(`standings:${code}`, () => getStandings(code), SHORT_TTL)
  }

  function fetchCompetitionTeams(code: string): Promise<Team[]> {
    return cached(`teams:${code}`, () => getCompetitionTeams(code), LONG_TTL)
  }

  function fetchCompetitions(): Promise<Competition[]> {
    return cached('competitions', () => getCompetitions(), LONG_TTL)
  }

  return {
    selectedTeamId,
    selectTeam,
    clearTeam,
    fetchTeam,
    fetchTeamMatches,
    fetchStandings,
    fetchCompetitionTeams,
    fetchCompetitions,
  }
})
