export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // This is a placeholder.
      // Run 'npm run supabase:types' to generate the actual types from your Supabase project.
    }
  }
}
