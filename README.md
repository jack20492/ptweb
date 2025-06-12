# PT Management System

A comprehensive Personal Trainer management system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Admins
- **User Management**: Create, edit, and manage client accounts
- **Workout Plans**: Create detailed workout plans with exercises and sets
- **Meal Plans**: Design nutrition plans with detailed meal breakdowns
- **Content Management**: Manage homepage content, testimonials, and videos
- **Client Tracking**: Monitor client progress and weight records

### For Clients
- **Workout Tracking**: View assigned workouts and track progress
- **Meal Plans**: Access personalized nutrition plans
- **Weight Tracking**: Record and visualize weight progress
- **Progress Monitoring**: Compare performance across weeks

## Database Schema

The system uses Supabase with the following main tables:

- `users` - User accounts (admin and clients)
- `workout_plans` - Workout plans assigned to clients
- `workout_days` - Days within workout plans
- `exercises` - Individual exercises within workout days
- `exercise_sets` - Sets data for each exercise
- `meal_plans` - Meal plans for clients
- `meals` - Individual meals within meal plans
- `meal_foods` - Food items within each meal
- `weight_records` - Weight tracking records
- `testimonials` - Client testimonials
- `videos` - Training videos
- `contact_info` - Contact information settings
- `home_content` - Homepage content management

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pt-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file `supabase/migrations/create_initial_schema.sql`
   - Set up your environment variables in `.env`:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Default Admin Account

After running the migration, you can log in with:
- **Username**: `admin`
- **Password**: `admin123`

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control (Admin/Client)
- Secure authentication with Supabase Auth
- Protected routes and API endpoints

## Development

The project follows modern React patterns with:
- TypeScript for type safety
- Context API for state management
- Custom hooks for data fetching
- Responsive design with Tailwind CSS
- Component-based architecture

## Deployment

The application can be deployed to any static hosting service like:
- Vercel
- Netlify
- Supabase Hosting

Make sure to set the environment variables in your deployment platform.