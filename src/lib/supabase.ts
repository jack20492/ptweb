import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  username: string
  email: string
  password_hash?: string
  full_name: string
  phone?: string
  role: 'admin' | 'client'
  avatar?: string
  start_date?: string
  created_at: string
  updated_at: string
}

export interface WorkoutPlan {
  id: string
  name: string
  client_id: string
  week_number: number
  start_date: string
  created_by: 'admin' | 'client'
  created_at: string
  updated_at: string
  workout_days?: WorkoutDay[]
}

export interface WorkoutDay {
  id: string
  workout_plan_id: string
  day_name: string
  day_order: number
  is_rest_day: boolean
  created_at: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  workout_day_id: string
  name: string
  exercise_order: number
  created_at: string
  updated_at: string
  exercise_sets?: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number
  reality?: number
  weight?: number
  volume?: number
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  name: string
  client_id: string
  total_calories: number
  notes?: string
  created_at: string
  updated_at: string
  meals?: Meal[]
}

export interface Meal {
  id: string
  meal_plan_id: string
  name: string
  total_calories: number
  meal_order: number
  created_at: string
  meal_foods?: MealFood[]
}

export interface MealFood {
  id: string
  meal_id: string
  name: string
  macro_type: 'Carb' | 'Pro' | 'Fat'
  calories: number
  notes?: string
  food_order: number
  created_at: string
}

export interface WeightRecord {
  id: string
  client_id: string
  weight: number
  date: string
  notes?: string
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
  avatar?: string
  before_image?: string
  after_image?: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  youtube_id: string
  description: string
  category: string
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: string
  phone: string
  facebook: string
  zalo: string
  email: string
  updated_at: string
}

export interface HomeContent {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_image?: string
  about_text: string
  about_image?: string
  services_title: string
  services: string[]
  updated_at: string
}