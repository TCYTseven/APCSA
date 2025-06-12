# Supabase Database Setup for BodMax Fitness Tracking App

## Overview
BodMax is a React Native fitness tracking app built with Expo that uses AI-powered physique analysis to score muscle development. The app currently uses AsyncStorage for local data persistence but needs to migrate to Supabase for cloud-based storage, user authentication, and image management.

## Current App Architecture

### Data Models (from `lib/dataStore.ts`)
```typescript
interface UserProfile {
  id: string;
  email: string;
  gender: 'male' | 'female';
  height: number; // in inches
  weight: number; // in pounds
  desiredPhysique: string;
  createdAt: string;
  updatedAt: string;
}

interface PhysiqueRecord {
  id: string;
  userId: string;
  imageUri: string; // Currently local file paths - needs Supabase Storage
  scores: MuscleGroupScore; // JSON object with muscle group scores
  identifiedParts: string[]; // Array of detected muscle groups
  advice: string; // AI-generated advice
  createdAt: string;
}

interface MuscleGroupScore {
  [muscleGroup: string]: number; // Scores 0-100 for 13 muscle groups
}
```

### Muscle Groups Tracked
```
"Trapezius", "Triceps", "Forearm", "Calves", "Deltoids", "Chest", 
"Biceps", "Abs", "Quadriceps", "Upper back", "Lower back", "Hamstring", "Gluteal"
```

## Required Supabase Setup

### 1. Authentication
- **Email/password authentication** (no OAuth for now)
- User profiles should link to `auth.users.id`
- Onboarding flow collects: gender, height, weight, desired physique

### 2. Database Schema

#### `profiles` table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  height INTEGER NOT NULL, -- inches
  weight INTEGER NOT NULL, -- pounds
  desired_physique TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### `physique_records` table
```sql
CREATE TABLE physique_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  image_url TEXT NOT NULL, -- Supabase Storage URL
  scores JSONB NOT NULL, -- MuscleGroupScore object
  identified_parts TEXT[] NOT NULL, -- Array of muscle groups
  advice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE physique_records ENABLE ROW LEVEL SECURITY;

-- Users can only access their own records
CREATE POLICY "Users can view own records" ON physique_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON physique_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON physique_records
  FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_physique_records_user_id_created ON physique_records(user_id, created_at DESC);
```

#### `current_scores` table
```sql
CREATE TABLE current_scores (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  scores JSONB NOT NULL, -- Current best scores per muscle group
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE current_scores ENABLE ROW LEVEL SECURITY;

-- Users can only access their own scores
CREATE POLICY "Users can view own scores" ON current_scores
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Storage Buckets

#### `physique-images` bucket
```sql
-- Create storage bucket for physique photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('physique-images', 'physique-images', false);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'physique-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own images
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'physique-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'physique-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 4. Database Functions & Triggers

#### Auto-update current scores when new record is added
```sql
CREATE OR REPLACE FUNCTION update_current_scores()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO current_scores (user_id, scores, updated_at)
  VALUES (NEW.user_id, NEW.scores, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    scores = (
      SELECT jsonb_object_agg(
        key, 
        GREATEST(
          COALESCE((current_scores.scores->>key)::integer, 0),
          COALESCE((NEW.scores->>key)::integer, 0)
        )
      )
      FROM jsonb_each_text(current_scores.scores) 
      UNION 
      SELECT key, value::integer FROM jsonb_each_text(NEW.scores)
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_current_scores_trigger
  AFTER INSERT ON physique_records
  FOR EACH ROW
  EXECUTE FUNCTION update_current_scores();
```

#### Auto-create profile after user signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, gender, height, weight, desired_physique)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    COALESCE((NEW.raw_user_meta_data->>'height')::integer, 68),
    COALESCE((NEW.raw_user_meta_data->>'weight')::integer, 150),
    COALESCE(NEW.raw_user_meta_data->>'desired_physique', 'athletic')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Migration Strategy from AsyncStorage

#### Data Migration Helper
Create a migration function that:
1. Reads existing AsyncStorage data
2. Uploads images to Supabase Storage
3. Inserts records into Supabase tables
4. Updates image URLs to point to Supabase Storage
5. Clears AsyncStorage after successful migration

#### Key Changes Needed in App
1. Replace `dataStore.ts` with Supabase client calls
2. Update image handling to use Supabase Storage URLs
3. Add authentication flow integration
4. Update image upload logic to store in Supabase Storage with user-specific folders

### 6. Analytics & Progress Tracking

#### Views for analytics
```sql
-- View for progress over time
CREATE VIEW user_progress AS
SELECT 
  user_id,
  DATE(created_at) as date,
  AVG((scores->>key)::numeric) as avg_score,
  COUNT(*) as records_count
FROM physique_records,
     jsonb_each_text(scores)
GROUP BY user_id, DATE(created_at)
ORDER BY user_id, date;

-- View for best scores per muscle group
CREATE VIEW user_best_scores AS
SELECT 
  user_id,
  key as muscle_group,
  MAX((scores->>key)::numeric) as best_score
FROM physique_records,
     jsonb_each_text(scores)
GROUP BY user_id, key;
```

## Implementation Priority

1. **Phase 1**: Set up authentication and basic tables
2. **Phase 2**: Implement storage bucket and image upload
3. **Phase 3**: Replace AsyncStorage calls with Supabase calls
4. **Phase 4**: Add data migration from existing AsyncStorage
5. **Phase 5**: Add analytics views and advanced features

## Notes
- Keep the existing local API routes for AI analysis (no need for Edge Functions yet)
- Images should be stored in user-specific folders: `{user_id}/{timestamp}.jpg`
- Maintain backward compatibility during migration
- The app currently has mock data seeding that can be adapted for testing
- Calendar view on progress screen shows scan history - ensure efficient queries for this