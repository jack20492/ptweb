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

// Default values to prevent null errors
const defaultHomeContent: HomeContent = {
  id: '',
  hero_title: 'Phi Nguyễn Personal Trainer',
  hero_subtitle: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
  hero_image: null,
  about_text: 'Với nhiều năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn những buổi tập hiệu quả nhất.',
  about_image: null,
  services_title: 'Dịch vụ của tôi',
  services: [
    'Personal Training 1-1',
    'Lập kế hoạch tập luyện',
    'Tư vấn dinh dưỡng',
    'Theo dõi tiến độ'
  ],
  updated_at: null
}

const defaultContactInfo: ContactInfo = {
  id: '',
  phone: '0123456789',
  facebook: 'https://facebook.com/phinpt',
  zalo: 'https://zalo.me/0123456789',
  email: 'contact@phinpt.com',
  updated_at: null
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const [homeContent, setHomeContent] = useState<HomeContent>(defaultHomeContent)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch data with error handling for each request
      const results = await Promise.allSettled([
        fetchWorkoutPlans(),
        fetchMealPlans(),
        fetchWeightRecords(),
        fetchTestimonials(),
        fetchVideos(),
        fetchContactInfo(),
        fetchHomeContent(),
        fetchUsers()
      ])
      
      // Log any failed requests
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to fetch data for request ${index}:`, result.reason)
        }
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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

      if (error) {
        console.error('Error fetching workout plans:', error)
        return
      }
      
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
      // For demo, generate a simple ID and add to state
      const newPlan = {
        id: `plan-${Date.now()}`,
        name: planData.name,
        client_id: planData.clientId,
        week_number: planData.weekNumber || 1,
        start_date: planData.startDate,
        created_by: planData.createdBy || 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        days: planData.days
      }
      
      setWorkoutPlans(prev => [newPlan, ...prev])
    } catch (error) {
      console.error('Error adding workout plan:', error)
      throw error
    }
  }

  const updateWorkoutPlan = async (planId: string, updates: any) => {
    try {
      setWorkoutPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates, updated_at: new Date().toISOString() } : plan
      ))
    } catch (error) {
      console.error('Error updating workout plan:', error)
      throw error
    }
  }

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      setWorkoutPlans(prev => prev.filter(plan => plan.id !== planId))
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

      if (error) {
        console.error('Error fetching meal plans:', error)
        return
      }
      
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
      const newPlan = {
        id: `meal-${Date.now()}`,
        name: planData.name,
        client_id: planData.clientId,
        total_calories: planData.totalCalories,
        notes: planData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        meals: planData.meals
      }
      
      setMealPlans(prev => [newPlan, ...prev])
    } catch (error) {
      console.error('Error adding meal plan:', error)
      throw error
    }
  }

  const updateMealPlan = async (planId: string, updates: any) => {
    try {
      setMealPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates, updated_at: new Date().toISOString() } : plan
      ))
    } catch (error) {
      console.error('Error updating meal plan:', error)
      throw error
    }
  }

  const deleteMealPlan = async (planId: string) => {
    try {
      setMealPlans(prev => prev.filter(plan => plan.id !== planId))
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

      if (error) {
        console.error('Error fetching weight records:', error)
        return
      }
      setWeightRecords(data || [])
    } catch (error) {
      console.error('Error fetching weight records:', error)
    }
  }

  const addWeightRecord = async (record: Omit<WeightRecord, 'id' | 'created_at'>) => {
    try {
      const newRecord = {
        id: `weight-${Date.now()}`,
        ...record,
        created_at: new Date().toISOString()
      }
      setWeightRecords(prev => [newRecord, ...prev])
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

      if (error) {
        console.error('Error fetching testimonials:', error)
        return
      }
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    }
  }

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTestimonial = {
        id: `testimonial-${Date.now()}`,
        ...testimonial,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setTestimonials(prev => [newTestimonial, ...prev])
    } catch (error) {
      console.error('Error adding testimonial:', error)
      throw error
    }
  }

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      setTestimonials(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ))
    } catch (error) {
      console.error('Error updating testimonial:', error)
      throw error
    }
  }

  const deleteTestimonial = async (id: string) => {
    try {
      setTestimonials(prev => prev.filter(t => t.id !== id))
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

      if (error) {
        console.error('Error fetching videos:', error)
        return
      }
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newVideo = {
        id: `video-${Date.now()}`,
        ...video,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setVideos(prev => [newVideo, ...prev])
    } catch (error) {
      console.error('Error adding video:', error)
      throw error
    }
  }

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      setVideos(prev => prev.map(v => 
        v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v
      ))
    } catch (error) {
      console.error('Error updating video:', error)
      throw error
    }
  }

  const deleteVideo = async (id: string) => {
    try {
      setVideos(prev => prev.filter(v => v.id !== id))
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
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact info:', error)
        return
      }
      setContactInfo(data || defaultContactInfo)
    } catch (error) {
      console.error('Error fetching contact info:', error)
      setContactInfo(defaultContactInfo)
    }
  }

  const updateContactInfo = async (info: Omit<ContactInfo, 'id' | 'updated_at'>) => {
    try {
      setContactInfo({ ...info, id: contactInfo?.id || '', updated_at: new Date().toISOString() })
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
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching home content:', error)
        return
      }
      setHomeContent(data || defaultHomeContent)
    } catch (error) {
      console.error('Error fetching home content:', error)
      setHomeContent(defaultHomeContent)
    }
  }

  const updateHomeContent = async (content: Omit<HomeContent, 'id' | 'updated_at'>) => {
    try {
      setHomeContent({ ...content, id: homeContent?.id || '', updated_at: new Date().toISOString() })
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

      if (error) {
        console.error('Error fetching users:', error)
        return
      }
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addUser = async (userData: any) => {
    try {
      const newUser = {
        id: `user-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        password_hash: userData.password,
        full_name: userData.fullName,
        phone: userData.phone,
        role: userData.role,
        avatar: userData.avatar,
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUsers(prev => [newUser, ...prev])
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  const updateUser = async (id: string, updates: any) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === id ? { 
          ...user, 
          username: updates.username,
          email: updates.email,
          full_name: updates.fullName,
          phone: updates.phone,
          role: updates.role,
          avatar: updates.avatar,
          password_hash: updates.password || user.password_hash,
          updated_at: new Date().toISOString()
        } : user
      ))
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== id))
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