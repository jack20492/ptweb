import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Exercise {
  id: string;
  name: string;
  sets: {
    set: number;
    reps: number;
    reality?: number;
    weight?: number;
    volume?: number;
  }[];
}

interface DayWorkout {
  day: string;
  isRestDay: boolean;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  clientId: string;
  weekNumber: number;
  startDate: string;
  days: DayWorkout[];
  createdBy?: "admin" | "client";
}

interface FoodItem {
  name: string;
  macroType: "Carb" | "Pro" | "Fat";
  calories: number;
  notes: string;
}

interface MealPlan {
  id: string;
  name: string;
  clientId: string;
  meals: {
    name: string;
    totalCalories: number;
    foods: FoodItem[];
  }[];
  totalCalories: number;
  notes?: string;
}

interface WeightRecord {
  id: string;
  clientId: string;
  weight: number;
  date: string;
  notes?: string;
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  avatar?: string;
  rating: number;
  beforeImage?: string;
  afterImage?: string;
}

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  category: string;
}

interface ContactInfo {
  phone: string;
  facebook: string;
  zalo: string;
  email: string;
}

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  aboutText: string;
  aboutImage?: string;
  servicesTitle: string;
  services: string[];
}

interface DataContextType {
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  weightRecords: WeightRecord[];
  testimonials: Testimonial[];
  videos: Video[];
  contactInfo: ContactInfo;
  homeContent: HomeContent;
  addWorkoutPlan: (plan: WorkoutPlan) => void;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkoutPlan: (planId: string) => void;
  addMealPlan: (plan: MealPlan) => void;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (planId: string) => void;
  addWeightRecord: (record: WeightRecord) => void;
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  updateContactInfo: (info: ContactInfo) => void;
  updateHomeContent: (content: HomeContent) => void;
  createNewWeekPlan: (clientId: string, templatePlanId: string) => void;
  duplicateWorkoutPlan: (planId: string, assignClientId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "0123456789",
    facebook: "https://facebook.com/phinpt",
    zalo: "https://zalo.me/0123456789",
    email: "contact@phinpt.com",
  });
  const [homeContent, setHomeContent] = useState<HomeContent>({
    heroTitle: "Phi Nguyễn Personal Trainer",
    heroSubtitle:
      "Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness",
    aboutText:
      "Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.",
    servicesTitle: "Dịch vụ của tôi",
    services: [
      "Tư vấn chế độ tập luyện cá nhân",
      "Thiết kế chương trình dinh dưỡng",
      "Theo dõi tiến độ và điều chỉnh",
      "Hỗ trợ 24/7 qua các kênh liên lạc",
    ],
  });

  useEffect(() => {
    const savedWorkoutPlans = localStorage.getItem("pt_workout_plans");
    if (savedWorkoutPlans) setWorkoutPlans(JSON.parse(savedWorkoutPlans));
    const savedMealPlans = localStorage.getItem("pt_meal_plans");
    if (savedMealPlans) setMealPlans(JSON.parse(savedMealPlans));
    const savedWeightRecords = localStorage.getItem("pt_weight_records");
    if (savedWeightRecords) setWeightRecords(JSON.parse(savedWeightRecords));
    const savedTestimonials = localStorage.getItem("pt_testimonials");
    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    } else {
      const defaultTestimonials: Testimonial[] = [
        {
          id: "1",
          name: "Nguyễn Minh Anh",
          content:
            "Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.",
          rating: 5,
        },
        {
          id: "2",
          name: "Trần Văn Đức",
          content:
            "PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.",
          rating: 5,
        },
      ];
      setTestimonials(defaultTestimonials);
      localStorage.setItem(
        "pt_testimonials",
        JSON.stringify(defaultTestimonials)
      );
    }
    const savedVideos = localStorage.getItem("pt_videos");
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      const defaultVideos: Video[] = [
        {
          id: "1",
          title: "Bài tập cardio cơ bản tại nhà",
          youtubeId: "dQw4w9WgXcQ",
          description:
            "Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà",
          category: "Cardio",
        },
        {
          id: "2",
          title: "Tập ngực cho người mới bắt đầu",
          youtubeId: "dQw4w9WgXcQ",
          description:
            "Các bài tập phát triển cơ ngực hiệu quả dành cho newbie",
          category: "Strength",
        },
      ];
      setVideos(defaultVideos);
      localStorage.setItem("pt_videos", JSON.stringify(defaultVideos));
    }
    const savedContactInfo = localStorage.getItem("pt_contact_info");
    if (savedContactInfo) setContactInfo(JSON.parse(savedContactInfo));
    const savedHomeContent = localStorage.getItem("pt_home_content");
    if (savedHomeContent) setHomeContent(JSON.parse(savedHomeContent));
  }, []);

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addWorkoutPlan = (plan: WorkoutPlan) => {
    const newPlans = [...workoutPlans, plan];
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const updateWorkoutPlan = (planId: string, updates: Partial<WorkoutPlan>) => {
    const newPlans = workoutPlans.map((plan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const deleteWorkoutPlan = (planId: string) => {
    const newPlans = workoutPlans.filter((plan) => plan.id !== planId);
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const duplicateWorkoutPlan = (planId: string, assignClientId: string) => {
    const plan = workoutPlans.find((p) => p.id === planId);
    if (!plan || !assignClientId) return;
    const newPlan: WorkoutPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      clientId: assignClientId,
      weekNumber: 1,
      startDate: new Date().toISOString().split("T")[0],
      createdBy: "admin",
      days: plan.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => ({
          ...ex,
          id: `exercise-${Date.now()}-${Math.random()}`,
          sets: ex.sets.map((set) => ({
            ...set,
            reality: set.reps,
            weight: set.weight || 0,
            volume: set.reps * (set.weight || 0),
          })),
        })),
      })),
    };
    addWorkoutPlan(newPlan);
  };

  const addMealPlan = (plan: MealPlan) => {
    const newPlans = [...mealPlans, plan];
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const updateMealPlan = (planId: string, updates: Partial<MealPlan>) => {
    const newPlans = mealPlans.map((plan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const deleteMealPlan = (planId: string) => {
    const newPlans = mealPlans.filter((plan) => plan.id !== planId);
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const addWeightRecord = (record: WeightRecord) => {
    const newRecords = [...weightRecords, record];
    setWeightRecords(newRecords);
    saveToLocalStorage("pt_weight_records", newRecords);
  };

  const addTestimonial = (testimonial: Testimonial) => {
    const newTestimonials = [...testimonials, testimonial];
    setTestimonials(newTestimonials);
    saveToLocalStorage("pt_testimonials", newTestimonials);
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const newTestimonials = testimonials.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTestimonials(newTestimonials);
    saveToLocalStorage("pt_testimonials", newTestimonials);
  };

  const deleteTestimonial = (id: string) => {
    const newTestimonials = testimonials.filter((t) => t.id !== id);
    setTestimonials(newTestimonials);
    saveToLocalStorage("pt_testimonials", newTestimonials);
  };

  const addVideo = (video: Video) => {
    const newVideos = [...videos, video];
    setVideos(newVideos);
    saveToLocalStorage("pt_videos", newVideos);
  };

  const updateVideo = (id: string, updates: Partial<Video>) => {
    const newVideos = videos.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    setVideos(newVideos);
    saveToLocalStorage("pt_videos", newVideos);
  };

  const deleteVideo = (id: string) => {
    const newVideos = videos.filter((v) => v.id !== id);
    setVideos(newVideos);
    saveToLocalStorage("pt_videos", newVideos);
  };

  const updateContactInfo = (info: ContactInfo) => {
    setContactInfo(info);
    saveToLocalStorage("pt_contact_info", info);
  };

  const updateHomeContent = (content: HomeContent) => {
    setHomeContent(content);
    saveToLocalStorage("pt_home_content", content);
  };

  const createNewWeekPlan = (clientId: string, templatePlanId: string) => {
    const templatePlan = workoutPlans.find((p) => p.id === templatePlanId);
    if (!templatePlan) return;
    const clientPlans = workoutPlans.filter((p) => p.clientId === clientId);
    const newWeekNumber =
      Math.max(...clientPlans.map((p) => p.weekNumber), 0) + 1;
    const newPlan: WorkoutPlan = {
      ...templatePlan,
      id: `${clientId}-week-${newWeekNumber}-${Date.now()}`,
      weekNumber: newWeekNumber,
      startDate: new Date().toISOString().split("T")[0],
      days: templatePlan.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          id: `exercise-${Date.now()}-${Math.random()}`,
          sets: exercise.sets.map((set) => ({
            ...set,
            reality: set.reps,
            weight: set.weight || 0,
            volume: set.reps * (set.weight || 0),
          })),
        })),
      })),
      createdBy: "client",
    };
    addWorkoutPlan(newPlan);
  };

  return (
    <DataContext.Provider
      value={{
        workoutPlans,
        mealPlans,
        weightRecords,
        testimonials,
        videos,
        contactInfo,
        homeContent,
        addWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        addMealPlan,
        updateMealPlan,
        deleteMealPlan,
        addWeightRecord,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addVideo,
        updateVideo,
        deleteVideo,
        updateContactInfo,
        updateHomeContent,
        createNewWeekPlan,
        duplicateWorkoutPlan,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
