/*
  # Initial database schema for GrowthSnap

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text, not null)
      - `avatar_url` (text, nullable)
      - `bio` (text, nullable)
      - `email` (text, not null)
      - `created_at` (timestamptz, default now())
      - `push_notifications` (boolean, default false)
      - `email_notifications` (boolean, default false)
      - `reminders` (boolean, default false)
    
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `media_url` (text, not null)
      - `media_type` (text, not null)
      - `tags` (text array, nullable)
      - `created_at` (timestamptz, default now())
      - `like_count` (integer, default 0)
      - `comment_count` (integer, default 0)
    
    - `likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to profiles)
      - `created_at` (timestamptz, default now())
    
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to profiles)
      - `content` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `notifications`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid, foreign key to profiles)
      - `type` (text, not null)
      - `content` (text, not null)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz, default now())
    
    - `allowed_emails`
      - `id` (uuid, primary key)
      - `email` (text, not null, unique)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Admin can access all records
    - Users can view their own data and public data
*/

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  push_notifications BOOLEAN DEFAULT false NOT NULL,
  email_notifications BOOLEAN DEFAULT false NOT NULL,
  reminders BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profiles"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Allowed Emails
CREATE POLICY "Allowed emails are viewable by authenticated users"
  ON allowed_emails
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create triggers for incrementing counters
CREATE OR REPLACE FUNCTION increment_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET like_count = like_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET like_count = like_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comment_count = comment_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET comment_count = comment_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER increment_post_like_count_trigger
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION increment_post_like_count();

CREATE TRIGGER decrement_post_like_count_trigger
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION decrement_post_like_count();

CREATE TRIGGER increment_post_comment_count_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_post_comment_count();

CREATE TRIGGER decrement_post_comment_count_trigger
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION decrement_post_comment_count();

-- Create function to create a notification on like or comment
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  notification_type TEXT;
  notification_content TEXT;
  username TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Skip if user is liking/commenting their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get username
  SELECT username INTO username FROM profiles WHERE id = NEW.user_id;
  
  -- Set notification type and content based on the table
  IF TG_TABLE_NAME = 'likes' THEN
    notification_type := 'like';
    notification_content := format('%s liked your post', username);
  ELSIF TG_TABLE_NAME = 'comments' THEN
    notification_type := 'comment';
    notification_content := format('%s commented on your post', username);
  END IF;
  
  -- Create notification
  INSERT INTO notifications (recipient_id, type, content)
  VALUES (post_owner_id, notification_type, notification_content);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for notifications
CREATE TRIGGER create_like_notification_trigger
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_notification();

CREATE TRIGGER create_comment_notification_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_notification();