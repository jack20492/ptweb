import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { 
  WorkoutPlan, 
  MealPlan, 
  WeightRecord, 
  Testimonial, 
  Video, 
  ContactInfo, 
  HomeContent,
  User,
  WorkoutDay,
  Exercise,
  ExerciseSet,
  Meal,
  MealFood
} from '../lib/supabase'

interface DataContextType {
  // Data
  workoutPlans: WorkoutPlan[]
  mealPlans: MealPlan[]
  weightRecords: WeightRecord[]
  testimonials: Testimonial[]
  videos: Video[]
  contactInfo: ContactInfo | null
  homeContent: HomeContent | null
  users: User[]
  
  // Loading states
  loading: boolean
  
  // Workout Plans
  fetchWorkoutPlans: () => Promise<void>
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'> & { days: any[] }) => Promise<void>
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => Promise<void>
  deleteWorkoutPlan: (planId: string) => Promise<void>
  duplicateWorkoutPlan: (planId: string, assignClientId: string) => Promise<void>
  createNewWeekPlan: (clientId: string, templatePlanId: string) => Promise<void>
  
  // Meal Plans
  fetchMealPlans: () => Promise<void>
  addMealPlan: (plan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'> & { meals: any[] }) => Promise<void>
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => Promise<void>
  deleteMealPlan: (planId: string) => Promise<void>
  
  // Weight Records
  fetchWeightRecords: () => Promise<void>
  addWeightRecord: (record: Omit<WeightRecord, 'id' | 'created_at'>) => Promise<void>
  
  // Testimonials
  fetchTestimonials: () => Promise<void>
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<void>
  deleteTestimonial: (id: string) => Promise<void>
  
  // Videos
  fetchVideos: () => Promise<void>
  addVideo: (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  
  // Settings
  fetchContactInfo: () => Promise<void>
  updateContactInfo: (info: Omit<ContactInfo, 'id' | 'updated_at'>) => Promise<void>
  fetchHomeContent: () => Promise<void>
  updateHomeContent: (content: Omit<HomeContent, 'id' | 'updated_at'>) => Promise<void>
  
  // Users
  fetchUsers: () => Promise<void>
  addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) => Promise<void>
  updateUser: (id: string, updates: Partial<User> & { password?: string }) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchWorkoutPlans(),
      fetchMealPlans(),
      fetchWeightRecords(),
      fetchTestimonials(),
      fetchVideos(),
      fetchContactInfo(),
      fetchHomeContent(),
      fetchUsers()
    ])
    setLoading(false)
  }

  // Workout Plans
  const fetchWorkoutPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days (
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match frontend structure
      const transformedPlans = data?.map(plan => ({
        ...plan,
        days: plan.workout_days?.map(day => ({
          day: day.day_name,
          isRestDay: day.is_rest_day,
          exercises: day.exercises?.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            sets: exercise.exercise_sets?.map(set => ({
              set: set.set_number,
              reps: set.reps,
              reality: set.reality,
              weight: set.weight,
              volume: set.volume
            })) || []
          })) || []
        })) || []
      })) || []

      setWorkoutPlans(transformedPlans)
    } catch (error) {
      console.error('Error fetching workout plans:', error)
    }
  }

  const addWorkoutPlan = async (planData: any) => {
    try {
      // Insert workout plan
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          name: planData.name,
          client_id: planData.clientId,
          week_number: planData.weekNumber || 1,
          start_date: planData.startDate,
          created_by: planData.createdBy || 'admin'
        })
        .select()
        .single()

      if (planError) throw planError

      // Insert workout days and exercises
      for (const [dayIndex, day] of planData.days.entries()) {
        const { data: workoutDay, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            workout_plan_id: plan.id,
            day_name: day.day,
            day_order: dayIndex + 1,
            is_rest_day: day.isRestDay
          })
          .select()
          .single()

        if (dayError) throw dayError

        if (!day.isRestDay && day.exercises) {
          for (const [exerciseIndex, exercise] of day.exercises.entries()) {
            const { data: exerciseData, error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                workout_day_id: workoutDay.id,
                name: exercise.name,
                exercise_order: exerciseIndex + 1
              })
              .select()
              .single()

            if (exerciseError) throw exerciseError

            // Insert exercise sets
            const sets = exercise.sets.map((set: any, setIndex: number) => ({
              exercise_id: exerciseData.id,
              set_number: setIndex + 1,
              reps: set.reps,
              reality: set.reality,
              weight: set.weight,
              volume: set.volume
            }))

            const { error: setsError } = await supabase
              .from('exercise_sets')
              .insert(sets)

            if (setsError) throw setsError
          }
        }
      }

      await fetchWorkoutPlans()
    } catch (error) {
      console.error('Error adding workout plan:', error)
      throw error
    }
  }

  const updateWorkoutPlan = async (planId: string, updates: any) => {
    try {
      // Update the workout plan
      const { error: planError } = await supabase
        .from('workout_plans')
        .update({
          name: updates.name,
          week_number: updates.weekNumber,
          start_date: updates.startDate
        })
        .eq('id', planId)

      if (planError) throw planError

      // If days are updated, we need to handle the complex update
      if (updates.days) {
        // Delete existing days and recreate (simpler approach)
        const { error: deleteDaysError } = await supabase
          .from('workout_days')
          .delete()
          .eq('workout_plan_id', planId)

        if (deleteDaysError) throw deleteDaysError

        // Recreate days
        for (const [dayIndex, day] of updates.days.entries()) {
          const { data: workoutDay, error: dayError } = await supabase
            .from('workout_days')
            .insert({
              workout_plan_id: planId,
              day_name: day.day,
              day_order: dayIndex + 1,
              is_rest_day: day.isRestDay
            })
            .select()
            .single()

          if (dayError) throw dayError

          if (!day.isRestDay && day.exercises) {
            for (const [exerciseIndex, exercise] of day.exercises.entries()) {
              const { data: exerciseData, error: exerciseError } = await supabase
                .from('exercises')
                .insert({
                  workout_day_id: workoutDay.id,
                  name: exercise.name,
                  exercise_order: exerciseIndex + 1
                })
                .select()
                .single()

              if (exerciseError) throw exerciseError

              const sets = exercise.sets.map((set: any, setIndex: number) => ({
                exercise_id: exerciseData.id,
                set_number: setIndex + 1,
                reps: set.reps,
                reality: set.reality,
                weight: set.weight,
                volume: set.volume
              }))

              const { error: setsError } = await supabase
                .from('exercise_sets')
                .insert(sets)

              if (setsError) throw setsError
            }
          }
        }
      }

      await fetchWorkoutPlans()
    } catch (error) {
      console.error('Error updating workout plan:', error)
      throw error
    }
  }

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      await fetchWorkoutPlans()
    } catch (error) {
      console.error('Error deleting workout plan:', error)
      throw error
    }
  }

  const duplicateWorkoutPlan = async (planId: string, assignClientId: string) => {
    try {
      const originalPlan = workoutPlans.find(p => p.id === planId)
      if (!originalPlan) throw new Error('Plan not found')

      await addWorkoutPlan({
        name: originalPlan.name + ' (Copy)',
        clientId: assignClientId,
        weekNumber: 1,
        startDate: new Date().toISOString().split('T')[0],
        createdBy: 'admin',
        days: originalPlan.days
      })
    } catch (error) {
      console.error('Error duplicating workout plan:', error)
      throw error
    }
  }

  const createNewWeekPlan = async (clientId: string, templatePlanId: string) => {
    try {
      const templatePlan = workoutPlans.find(p => p.id === templatePlanId)
      if (!templatePlan) throw new Error('Template plan not found')

      const clientPlans = workoutPlans.filter(p => p.client_id === clientId)
      const newWeekNumber = Math.max(...clientPlans.map(p => p.week_number), 0) + 1

      await addWorkoutPlan({
        name: templatePlan.name,
        clientId: clientId,
        weekNumber: newWeekNumber,
        startDate: new Date().toISOString().split('T')[0],
        createdBy: 'client',
        days: templatePlan.days
      })
    } catch (error) {
      console.error('Error creating new week plan:', error)
      throw error
    }
  }

  // Meal Plans
  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            *,
            meal_foods (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedPlans = data?.map(plan => ({
        ...plan,
        meals: plan.meals?.map(meal => ({
          name: meal.name,
          totalCalories: meal.total_calories,
          foods: meal.meal_foods?.map(food => ({
            name: food.name,
            macroType: food.macro_type,
            calories: food.calories,
            notes: food.notes
          })) || []
        })) || []
      })) || []

      setMealPlans(transformedPlans)
    } catch (error) {
      console.error('Error fetching meal plans:', error)
    }
  }

  const addMealPlan = async (planData: any) => {
    try {
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          name: planData.name,
          client_id: planData.clientId,
          total_calories: planData.totalCalories,
          notes: planData.notes
        })
        .select()
        .single()

      if (planError) throw planError

      for (const [mealIndex, meal] of planData.meals.entries()) {
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.name,
            total_calories: meal.totalCalories,
            meal_order: mealIndex + 1
          })
          .select()
          .single()

        if (mealError) throw mealError

        const foods = meal.foods.map((food: any, foodIndex: number) => ({
          meal_id: mealData.id,
          name: food.name,
          macro_type: food.macroType,
          calories: food.calories,
          notes: food.notes,
          food_order: foodIndex + 1
        }))

        const { error: foodsError } = await supabase
          .from('meal_foods')
          .insert(foods)

        if (foodsError) throw foodsError
      }

      await fetchMealPlans()
    } catch (error) {
      console.error('Error adding meal plan:', error)
      throw error
    }
  }

  const updateMealPlan = async (planId: string, updates: any) => {
    try {
      const { error: planError } = await supabase
        .from('meal_plans')
        .update({
          name: updates.name,
          total_calories: updates.totalCalories,
          notes: updates.notes
        })
        .eq('id', planId)

      if (planError) throw planError

      if (updates.meals) {
        // Delete existing meals and recreate
        const { error: deleteMealsError } = await supabase
          .from('meals')
          .delete()
          .eq('meal_plan_id', planId)

        if (deleteMealsError) throw deleteMealsError

        for (const [mealIndex, meal] of updates.meals.entries()) {
          const { data: mealData, error: mealError } = await supabase
            .from('meals')
            .insert({
              meal_plan_id: planId,
              name: meal.name,
              total_calories: meal.totalCalories,
              meal_order: mealIndex + 1
            })
            .select()
            .single()

          if (mealError) throw mealError

          const foods = meal.foods.map((food: any, foodIndex: number) => ({
            meal_id: mealData.id,
            name: food.name,
            macro_type: food.macroType,
            calories: food.calories,
            notes: food.notes,
            food_order: foodIndex + 1
          }))

          const { error: foodsError } = await supabase
            .from('meal_foods')
            .insert(foods)

          if (foodsError) throw foodsError
        }
      }

      await fetchMealPlans()
    } catch (error) {
      console.error('Error updating meal plan:', error)
      throw error
    }
  }

  const deleteMealPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      await fetchMealPlans()
    } catch (error) {
      console.error('Error deleting meal plan:', error)
      throw error
    }
  }

  // Weight Records
  const fetchWeightRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setWeightRecords(data || [])
    } catch (error) {
      console.error('Error fetching weight records:', error)
    }
  }

  const addWeightRecord = async (record: Omit<WeightRecord, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('weight_records')
        .insert(record)

      if (error) throw error
      await fetchWeightRecords()
    } catch (error) {
      console.error('Error adding weight record:', error)
      throw error
    }
  }

  // Testimonials
  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    }
  }

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert(testimonial)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error('Error adding testimonial:', error)
      throw error
    }
  }

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      throw error
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      throw error
    }
  }

  // Videos
  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .insert(video)

      if (error) throw error
      await fetchVideos()
    } catch (error) {
      console.error('Error adding video:', error)
      throw error
    }
  }

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchVideos()
    } catch (error) {
      console.error('Error updating video:', error)
      throw error
    }
  }

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      throw error
    }
  }

  // Contact Info
  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setContactInfo(data)
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const updateContactInfo = async (info: Omit<ContactInfo, 'id' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('contact_info')
        .upsert(info)

      if (error) throw error
      await fetchContactInfo()
    } catch (error) {
      console.error('Error updating contact info:', error)
      throw error
    }
  }

  // Home Content
  const fetchHomeContent = async () => {
    try {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setHomeContent(data)
    } catch (error) {
      console.error('Error fetching home content:', error)
    }
  }

  const updateHomeContent = async (content: Omit<HomeContent, 'id' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('home_content')
        .upsert(content)

      if (error) throw error
      await fetchHomeContent()
    } catch (error) {
      console.error('Error updating home content:', error)
      throw error
    }
  }

  // Users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addUser = async (userData: any) => {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      })

      if (authError) throw authError

      // Insert user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          username: userData.username,
          email: userData.email,
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          avatar: userData.avatar
        })

      if (profileError) throw profileError
      await fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  const updateUser = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: updates.username,
          email: updates.email,
          full_name: updates.fullName,
          phone: updates.phone,
          role: updates.role,
          avatar: updates.avatar
        })
        .eq('id', id)

      if (error) throw error

      // Update password if provided
      if (updates.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: updates.password
        })
        if (passwordError) console.error('Error updating password:', passwordError)
      }

      await fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  return (
    <DataContext.Provider value={{
      // Data
      workoutPlans,
      mealPlans,
      weightRecords,
      testimonials,
      videos,
      contactInfo,
      homeContent,
      users,
      loading,
      
      // Workout Plans
      fetchWorkoutPlans,
      addWorkoutPlan,
      updateWorkoutPlan,
      deleteWorkoutPlan,
      duplicateWorkoutPlan,
      createNewWeekPlan,
      
      // Meal Plans
      fetchMealPlans,
      addMealPlan,
      updateMealPlan,
      deleteMealPlan,
      
      // Weight Records
      fetchWeightRecords,
      addWeightRecord,
      
      // Testimonials
      fetchTestimonials,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      
      // Videos
      fetchVideos,
      addVideo,
      updateVideo,
      deleteVideo,
      
      // Settings
      fetchContactInfo,
      updateContactInfo,
      fetchHomeContent,
      updateHomeContent,
      
      // Users
      fetchUsers,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </DataContext.Provider>
  )
}