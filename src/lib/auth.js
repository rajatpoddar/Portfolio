import { supabase } from './supabase';

export const auth = {
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthChange: (callback) => supabase.auth.onAuthStateChange(callback),
};
