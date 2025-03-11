
import { supabase } from "@/integrations/supabase/client";

// Save search to Supabase
export const saveSearchToSupabase = async (query: string, response: string, userId: string) => {
  try {
    // First create a chat session
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([
        { 
          user_id: userId,
          title: query.substring(0, 50) + (query.length > 50 ? '...' : '')
        }
      ])
      .select('id')
      .single();
    
    if (sessionError) throw sessionError;
    
    // Then save the messages
    const { error: userQueryError } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionData.id,
          user_id: userId,
          content: query,
          is_ai: false
        }
      ]);
    
    if (userQueryError) throw userQueryError;
    
    const { error: aiResponseError } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionData.id,
          user_id: userId,
          content: response,
          is_ai: true
        }
      ]);
    
    if (aiResponseError) throw aiResponseError;
    
    return true;
  } catch (error) {
    console.error("Error saving to Supabase:", error);
    return false;
  }
};

// Get history items from Supabase
export const getHistoryItemsFromSupabase = async (userId: string) => {
  try {
    // Get all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (sessionsError) throw sessionsError;
    
    // For each session, get the messages
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        return {
          ...session,
          messages
        };
      })
    );
    
    return sessionsWithMessages;
  } catch (error) {
    console.error("Error fetching history from Supabase:", error);
    return [];
  }
};

// Clear history from Supabase
export const clearHistoryFromSupabase = async (userId: string) => {
  try {
    // Delete all chat sessions for user (this will cascade delete messages due to foreign key constraint)
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error clearing history from Supabase:", error);
    return false;
  }
};

// Delete a specific chat session
export const deleteChatSession = async (sessionId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return false;
  }
};

// Save law to Supabase cache
export const saveLawToCache = async (category: string, lawName: string, content: any) => {
  try {
    // Check if law already exists
    const { data: existingLaw } = await supabase
      .from('laws_cache')
      .select('id')
      .eq('category', category)
      .eq('law_name', lawName)
      .maybeSingle();
    
    if (existingLaw) {
      // Update existing law
      const { error } = await supabase
        .from('laws_cache')
        .update({ 
          content,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingLaw.id);
      
      if (error) throw error;
    } else {
      // Insert new law
      const { error } = await supabase
        .from('laws_cache')
        .insert([
          {
            category,
            law_name: lawName,
            content,
            last_updated: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving law to cache:", error);
    return false;
  }
};

// Get all laws from cache
export const getLawsFromCache = async () => {
  try {
    const { data, error } = await supabase
      .from('laws_cache')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    
    // Format data to match expected structure
    const formattedData: Record<string, Record<string, any>> = {};
    
    data.forEach(item => {
      if (!formattedData[item.category]) {
        formattedData[item.category] = {};
      }
      
      formattedData[item.category][item.law_name] = item.content;
    });
    
    return formattedData;
  } catch (error) {
    console.error("Error getting laws from cache:", error);
    return null;
  }
};
