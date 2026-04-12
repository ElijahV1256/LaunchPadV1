/*
  # Create website bookings table

  1. New Tables
    - `website_bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `business_name` (text)
      - `calendly_event_uri` (text)
      - `booking_time` (timestamptz)
      - `status` (text, default 'booked')
      - `notes` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `website_bookings` table
    - Separate policies for select, insert, update, delete for authenticated users on their own data
*/

CREATE TABLE IF NOT EXISTS website_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  calendly_event_uri text,
  booking_time timestamptz,
  status text DEFAULT 'booked',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE website_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON website_bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON website_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON website_bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON website_bookings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
