'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

// All the user data keys that need to be persisted
const PERSIST_KEYS = [
  // Budget
  'incomeStreams', 'expenses', 'debts', 'goals', 'assets', 'liabilities',
  'paidOccurrences', 'debtExtraPayment', 'customPresets', 'payslipData',
  // Trading
  'trades', 'tradeImages', 'propAccounts', 'personalAccounts', 'propPayouts',
  'tradePlans', 'sessionPlans', 'dailyCheckIn', 'riskLimits', 'myStrategy',
  'strategyBuilder', 'monthlyPLGoal', 'coachMessages',
  // Preferences
  'appMode', 'darkMode', 'dismissedSavings', 'xpPoints', 'achievements',
  'tradingSections', 'tradingPayoutsAsIncome',
] as const

export type UserData = {
  [K in typeof PERSIST_KEYS[number]]?: any
}

interface UseUserDataResult {
  userData: UserData | null
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  saveUserData: (data: UserData) => Promise<void>
  loadUserData: () => Promise<UserData | null>
}

export function useUserData(userId: string | undefined): UseUserDataResult {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestDataRef = useRef<UserData | null>(null)

  // Load user data from Supabase
  const loadUserData = useCallback(async (): Promise<UserData | null> => {
    if (!userId) return null
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (new user), which is fine
        console.error('Load error:', error)
        // Try localStorage fallback
        const local = localStorage.getItem(`aureus_${userId}`)
        if (local) {
          const parsed = JSON.parse(local)
          setUserData(parsed)
          setIsLoading(false)
          return parsed
        }
        setIsLoading(false)
        return null
      }

      if (data?.data) {
        // Handle paidOccurrences — convert array back to Set later in page.tsx
        const loaded = data.data as UserData
        setUserData(loaded)
        // Also cache in localStorage for offline/fast loads
        localStorage.setItem(`aureus_${userId}`, JSON.stringify(loaded))
        setIsLoading(false)
        return loaded
      }

      setIsLoading(false)
      return null
    } catch (err) {
      console.error('Load failed:', err)
      // Try localStorage fallback
      const local = localStorage.getItem(`aureus_${userId}`)
      if (local) {
        const parsed = JSON.parse(local)
        setUserData(parsed)
      }
      setIsLoading(false)
      return null
    }
  }, [userId])

  // Save user data to Supabase (debounced)
  const saveUserData = useCallback(async (data: UserData) => {
    if (!userId) return

    latestDataRef.current = data

    // Cache immediately in localStorage
    localStorage.setItem(`aureus_${userId}`, JSON.stringify(data))

    // Debounce the Supabase save (2 seconds)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const saveData = latestDataRef.current
      if (!saveData) return

      setIsSaving(true)
      try {
        const { error } = await supabase
          .from('user_data')
          .upsert({
            user_id: userId,
            data: saveData,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })

        if (error) {
          console.error('Save error:', error)
        } else {
          setLastSaved(new Date())
        }
      } catch (err) {
        console.error('Save failed:', err)
      } finally {
        setIsSaving(false)
      }
    }, 2000)
  }, [userId])

  // Load on mount / user change
  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId, loadUserData])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    userData,
    isLoading,
    isSaving,
    lastSaved,
    saveUserData,
    loadUserData,
  }
}
