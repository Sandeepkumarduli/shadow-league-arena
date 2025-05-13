
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Utility function to handle data fetching with improved error handling
 */
export async function fetchData<T = any>(
  tableName: string,
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

    let query = supabase.from(tableName).select(join ? `${columns}, ${join}` : columns);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending !== false,
      });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Execute query
    const { data, error } = single ? await query.single() : await query;

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
  tableName: string,
  options: {
    data?: any;
    filters?: Record<string, any>;
  }
): Promise<T> {
  try {
    const { data = {}, filters = {} } = options;
    
    let query;
    
    switch (action) {
      case "insert":
        query = supabase.from(tableName).insert(data);
        break;
      case "update":
        query = supabase.from(tableName).update(data);
        break;
      case "delete":
        query = supabase.from(tableName).delete();
        break;
      default:
        throw new Error("Invalid action type");
    }
    
    // Apply filters for update and delete
    if (action !== "insert") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
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
