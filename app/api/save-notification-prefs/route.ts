// app/api/save-notification-prefs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userToken, email, userName, frequency,
      notifyWeeklySnapshot, notifyOverdueBills, notifyMoneyDate, notifyMonthlyMealPlan,
      householdSize, mealBudget, mealDislikes, mealDietary,
      moneyDateDay, moneyDateTime,
      // Real financial numbers
      monthlyIncome, monthlyExpenses, monthlyDebtPayments, monthlyGoalSavings,
      monthlySurplus, savingRate,
      topGoalName, topGoalPct,
      topWin, nextAction, streak, upcomingBills,
      debts, goals, mortgageAccel
    } = body

    if (!userToken || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.from('notification_prefs').upsert({
      user_token: userToken,
      email,
      user_name: userName || '',
      frequency: frequency || 'daily',
      notify_weekly_snapshot: notifyWeeklySnapshot ?? true,
      notify_overdue_bills: notifyOverdueBills ?? true,
      notify_money_date: notifyMoneyDate ?? true,
      notify_monthly_meal_plan: notifyMonthlyMealPlan ?? false,
      household_size: householdSize || 4,
      meal_budget: mealBudget || 150,
      meal_dislikes: mealDislikes || '',
      meal_dietary: mealDietary || '',
      money_date_day: moneyDateDay || 'Sunday',
      money_date_time: moneyDateTime || '18:00',
      // Real financial numbers for email
      monthly_income: monthlyIncome || 0,
      monthly_expenses: monthlyExpenses || 0,
      monthly_debt_payments: monthlyDebtPayments || 0,
      monthly_goal_savings: monthlyGoalSavings || 0,
      monthly_surplus: monthlySurplus || 0,
      saving_rate: savingRate || 0,
      top_goal_name: topGoalName || null,
      top_goal_pct: topGoalPct || 0,
      top_win: topWin || null,
      next_action: nextAction || null,
      streak: streak || 0,
      upcoming_bills: upcomingBills || [],
      debts: debts || [],
      goals: goals || [],
      mortgage_accel: mortgageAccel || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_token' })

    if (error) {
      console.error('Save notification prefs error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Save notification prefs error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to save preferences' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userToken } = await request.json()
    if (!userToken) return NextResponse.json({ error: 'Missing userToken' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    await supabase.from('notification_prefs').delete().eq('user_token', userToken)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
