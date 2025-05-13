
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

// Define valid table names to avoid type errors
export type TableName = 'admin_requests' | 'users' | 'news' | 'notifications' | 
  'team_members' | 'teams' | 'tournament_registrations' | 'tournaments' | 
  'tournament_results' | 'transactions' | 'wallets';

/**
 * Utility function to handle data fetching with improved error handling
 */
export async function fetchData<T = any>(
  tableName: TableName,
  options: {
    columns?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    join?: string;
  } = {}
): Promise<T> {
  try {
    const {
      columns = "*",
      filters = {},
      orderBy,
      limit,
      single = false,
      join,
    } = options;

    // Create the base query string
    const queryString = join ? `${columns}, ${join}` : columns;
    
    // Start building the query with a type assertion to break the recursive typing
    const query = supabase.from(tableName).select(queryString) as any;
    
    // Apply filters without reassigning the query variable
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.eq(key, value);
      }
    });

    // Apply ordering if specified (without reassignment)
    if (orderBy) {
      query.order(orderBy.column, {
        ascending: orderBy.ascending !== false,
      });
    }

    // Apply limit if specified (without reassignment)
    if (limit) {
      query.limit(limit);
    }

    // Execute query with appropriate method
    const { data, error } = single 
      ? await query.single() 
      : await query;

    if (error) {
      throw error;
    }

    return data as T;
  } catch (error: any) {
    console.error(`Error fetching data from ${tableName}:`, error);
    
    // Only show toast for user-facing errors, not during initial loads
    if (error.code !== 'PGRST116') { // Filter out "no rows returned" error
      toast({
        title: "Failed to load data",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
    }
    
    throw error;
  }
}

/**
 * Utility function to handle data mutations (insert, update, delete) with optimized error handling
 */
export async function mutateData<T = any>(
  action: "insert" | "update" | "delete",
  tableName: TableName,
  options: {
    data?: any;
    filters?: Record<string, any>;
  }
): Promise<T> {
  try {
    const { data = {}, filters = {} } = options;
    
    let query;
    
    // Type-safe query creation based on action
    switch (action) {
      case "insert":
        query = supabase.from(tableName).insert(data) as any;
        break;
      case "update":
        query = supabase.from(tableName).update(data) as any;
        break;
      case "delete":
        query = supabase.from(tableName).delete() as any;
        break;
      default:
        throw new Error("Invalid action type");
    }
    
    // Apply filters for update and delete without reassignment
    if (action !== "insert") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.eq(key, value);
        }
      });
    }
    
    // Execute query
    const { data: responseData, error } = await query.select();
    
    if (error) {
      throw error;
    }
    
    return responseData as T;
  } catch (error: any) {
    console.error(`Error ${action} data in ${tableName}:`, error);
    
    toast({
      title: `Failed to ${action} data`,
      description: error.message || "Please try again",
      variant: "destructive",
    });
    
    throw error;
  }
}
