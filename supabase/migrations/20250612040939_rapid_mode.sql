/*
  # Initial Database Schema for PT Management System

  1. New Tables
    - `users` - User accounts (admin and clients)
    - `workout_plans` - Workout plans assigned to clients
    - `exercises` - Individual exercises within workout plans
    - `exercise_sets` - Sets data for each exercise
    - `meal_plans` - Meal plans for clients
    - `meals` - Individual meals within meal plans
    - `meal_foods` - Food items within each meal
    - `weight_records` - Weight tracking records
    - `testimonials` - Client testimonials
    - `videos` - Training videos
    - `contact_info` - Contact information settings
    - `home_content` - Homepage content management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for management tables

  3. Initial Data
    - Create default admin account
    - Insert default contact info and home content
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  avatar text,
  start_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by text DEFAULT 'admin' CHECK (created_by IN ('admin', 'client')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Days within workout plans
CREATE TABLE IF NOT EXISTS workout_days (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_name text NOT NULL,
  day_order integer NOT NULL,
  is_rest_day boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Exercises within workout days
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_day_id uuid NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  exercise_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sets for each exercise
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer NOT NULL DEFAULT 0,
  reality integer,
  weight numeric(5,2) DEFAULT 0,
  volume numeric(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL DEFAULT 'Chế độ dinh dưỡng',
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_calories integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meals within meal plans
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_calories integer DEFAULT 0,
  meal_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Food items within meals
CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  name text NOT NULL,
  macro_type text NOT NULL DEFAULT 'Carb' CHECK (macro_type IN ('Carb', 'Pro', 'Fat')),
  calories integer NOT NULL DEFAULT 0,
  notes text,
  food_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Weight records table
CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight numeric(5,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar text,
  before_image text,
  after_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  youtube_id text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Cardio',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact info table (single row)
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text NOT NULL,
  facebook text NOT NULL,
  zalo text NOT NULL,
  email text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Home content table (single row)
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_image text,
  about_text text NOT NULL,
  about_image text,
  services_title text NOT NULL,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete clients" ON users
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND role = 'client'
  );

-- Workout plans policies
CREATE POLICY "Users can read own workout plans" ON workout_plans
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can read all workout plans" ON workout_plans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage workout plans" ON workout_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can update own workout plans" ON workout_plans
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own workout plans" ON workout_plans
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Workout days policies
CREATE POLICY "Users can read own workout days" ON workout_days
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans 
      WHERE id = workout_plan_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all workout days" ON workout_days
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can manage own workout days" ON workout_days
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans 
      WHERE id = workout_plan_id AND client_id = auth.uid()
    )
  );

-- Exercises policies
CREATE POLICY "Users can read own exercises" ON exercises
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_days wd
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      WHERE wd.id = workout_day_id AND wp.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all exercises" ON exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can manage own exercises" ON exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_days wd
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      WHERE wd.id = workout_day_id AND wp.client_id = auth.uid()
    )
  );

-- Exercise sets policies
CREATE POLICY "Users can read own exercise sets" ON exercise_sets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_days wd ON e.workout_day_id = wd.id
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      WHERE e.id = exercise_id AND wp.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all exercise sets" ON exercise_sets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can manage own exercise sets" ON exercise_sets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_days wd ON e.workout_day_id = wd.id
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      WHERE e.id = exercise_id AND wp.client_id = auth.uid()
    )
  );

-- Meal plans policies
CREATE POLICY "Users can read own meal plans" ON meal_plans
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all meal plans" ON meal_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Meals policies
CREATE POLICY "Users can read own meals" ON meals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE id = meal_plan_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all meals" ON meals
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Meal foods policies
CREATE POLICY "Users can read own meal foods" ON meal_foods
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals m
      JOIN meal_plans mp ON m.meal_plan_id = mp.id
      WHERE m.id = meal_id AND mp.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all meal foods" ON meal_foods
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Weight records policies
CREATE POLICY "Users can read own weight records" ON weight_records
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert own weight records" ON weight_records
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can read all weight records" ON weight_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read policies for public content
CREATE POLICY "Anyone can read testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read videos" ON videos
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage videos" ON videos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read contact info" ON contact_info
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage contact info" ON contact_info
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read home content" ON home_content
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage home content" ON home_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_workout_plans_client_id ON workout_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_week_number ON workout_plans(week_number);
CREATE INDEX IF NOT EXISTS idx_workout_days_plan_id ON workout_days(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_exercises_day_id ON exercises(workout_day_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client_id ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan_id ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_client_id ON weight_records(client_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(date);

-- Insert default admin user (password: admin123)
-- Note: In production, use a proper password hashing function
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  phone,
  role
) VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@phinpt.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'admin123'
  'Phi Nguyễn PT',
  '0123456789',
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert default contact info
INSERT INTO contact_info (
  phone,
  facebook,
  zalo,
  email
) VALUES (
  '0123456789',
  'https://facebook.com/phinpt',
  'https://zalo.me/0123456789',
  'contact@phinpt.com'
) ON CONFLICT DO NOTHING;

-- Insert default home content
INSERT INTO home_content (
  hero_title,
  hero_subtitle,
  about_text,
  services_title,
  services
) VALUES (
  'Phi Nguyễn Personal Trainer',
  'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
  'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.',
  'Dịch vụ của tôi',
  '["Tư vấn chế độ tập luyện cá nhân", "Thiết kế chương trình dinh dưỡng", "Theo dõi tiến độ và điều chỉnh", "Hỗ trợ 24/7 qua các kênh liên lạc"]'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert default testimonials
INSERT INTO testimonials (name, content, rating) VALUES 
('Nguyễn Minh Anh', 'Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.', 5),
('Trần Văn Đức', 'PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.', 5)
ON CONFLICT DO NOTHING;

-- Insert default videos
INSERT INTO videos (title, youtube_id, description, category) VALUES 
('Bài tập cardio cơ bản tại nhà', 'dQw4w9WgXcQ', 'Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà', 'Cardio'),
('Tập ngực cho người mới bắt đầu', 'dQw4w9WgXcQ', 'Các bài tập phát triển cơ ngực hiệu quả dành cho newbie', 'Strength')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_sets_updated_at BEFORE UPDATE ON exercise_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();