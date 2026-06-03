// app/api/save-notification-prefs/route.ts
// Called from Aureus when user enables email notifications.
// Saves their email + snapshot data to Supabase so the cron job can find them.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userToken, email, userName, frequency,
      notifyWeeklySnapshot, notifyOverdueBills, notifyMoneyDate, notifyMonthlyMealPlan,
      householdSize, mealBudget, mealDislikes, mealDietary,
      moneyDateDay, moneyDateTime,
      savingRate, monthlySurplus, topGoal, topWin, nextAction, streak,
      upcomingBills
    } = body

    if (!userToken || !email) {
      return NextResponse.json({ error: 'userToken and email required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notification_prefs')
      .upsert({
        user_token: userToken,
        email,
        user_name: userName || 'Aureus User',
        frequency: frequency || 'weekly',
        notify_weekly_snapshot: notifyWeeklySnapshot ?? true,
        notify_overdue_bills: notifyOverdueBills ?? true,
        notify_money_date: notifyMoneyDate ?? true,
        notify_monthly_meal_plan: notifyMonthlyMealPlan ?? false,
        household_size: householdSize || 4,
        meal_budget: mealBudget || 150,
        meal_dislikes: mealDislikes || null,
        meal_dietary: mealDietary || null,
        money_date_day: moneyDateDay || 'Sunday',
        money_date_time: moneyDateTime || '18:00',
        saving_rate: savingRate || 0,
        monthly_surplus: monthlySurplus || 0,
        top_goal_name: topGoal?.name || null,
        top_goal_pct: topGoal?.pct || null,
        top_win: topWin || null,
        next_action: nextAction || null,
        streak: streak || 0,
        upcoming_bills: upcomingBills || [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_token' })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // Unsubscribe — called when user turns off notifications
  try {
    const { userToken } = await request.json()
    if (!userToken) return NextResponse.json({ error: 'userToken required' }, { status: 400 })
    await supabase.from('notification_prefs').delete().eq('user_token', userToken)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 })
  }
}
