
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalUsers: number;
  totalTournaments: number;
  activeMatches: number;
  totalEarnings: number;
}

interface MonthlyData {
  name: string;
  tournaments: number;
  users: number;
  earnings: number;
}

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total tournaments count
    const { count: tournamentsCount, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact', head: true });

    if (tournamentsError) throw tournamentsError;

    // Get active tournaments/matches count
    const { count: activeMatchesCount, error: activeMatchesError } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ongoing');

    if (activeMatchesError) throw activeMatchesError;

    // Get total earnings (sum of all transactions)
    const { data: earnings, error: earningsError } = await supabase
      .from('transactions')
      .select('amount');
    
    if (earningsError) throw earningsError;
    
    const totalEarnings = earnings.reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalUsers: usersCount || 0,
      totalTournaments: tournamentsCount || 0,
      activeMatches: activeMatchesCount || 0,
      totalEarnings: totalEarnings || 0
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return defaults in case of error
    return {
      totalUsers: 0,
      totalTournaments: 0,
      activeMatches: 0,
      totalEarnings: 0
    };
  }
};

export const fetchMonthlyData = async (monthsCount: number = 6): Promise<MonthlyData[]> => {
  try {
    const today = new Date();
    const monthlyData: MonthlyData[] = [];
    
    // Get data for last N months
    for (let i = 0; i < monthsCount; i++) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Format for comparison with Supabase dates
      const startDate = startOfMonth.toISOString();
      const endDate = endOfMonth.toISOString();
      
      // Get tournaments created in this month
      const { count: tournamentsCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // Get users registered in this month
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // Get earnings in this month
      const { data: earnings } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      const monthlyEarnings = earnings ? earnings.reduce((sum, transaction) => sum + transaction.amount, 0) : 0;
      
      // Add to the monthly data array
      monthlyData.push({
        name: month.toLocaleString('default', { month: 'short' }),
        tournaments: tournamentsCount || 0,
        users: usersCount || 0,
        earnings: monthlyEarnings
      });
    }
    
    // Reverse to show in chronological order
    return monthlyData.reverse();
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return [];
  }
};
