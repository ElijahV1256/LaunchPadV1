/*
  # Fix RLS policies to use (select auth.uid()) for performance

  1. Changes
    - Drops and recreates RLS policies on 11 tables to wrap auth.uid() in a select subquery
    - This prevents re-evaluation of auth.uid() for each row, improving query performance at scale

  2. Affected Tables
    - starter_websites, pro_website_requests, managed_websites, marketing_strategies,
      website_setup, website_suggestions, website_bookings, first_dollar_progress,
      marketing_playbook (direct user_id check)
    - managed_website_content, website_payments (EXISTS subquery via managed_websites)

  3. Security
    - No changes to access patterns or permissions
    - All policies remain restricted to authenticated users checking ownership
*/

-- starter_websites
DROP POLICY IF EXISTS "Users can view own starter websites" ON public.starter_websites;
DROP POLICY IF EXISTS "Users can insert own starter websites" ON public.starter_websites;
DROP POLICY IF EXISTS "Users can update own starter websites" ON public.starter_websites;
DROP POLICY IF EXISTS "Users can delete own starter websites" ON public.starter_websites;

CREATE POLICY "Users can view own starter websites" ON public.starter_websites
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own starter websites" ON public.starter_websites
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own starter websites" ON public.starter_websites
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own starter websites" ON public.starter_websites
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- pro_website_requests
DROP POLICY IF EXISTS "Users can view own pro website requests" ON public.pro_website_requests;
DROP POLICY IF EXISTS "Users can insert own pro website requests" ON public.pro_website_requests;
DROP POLICY IF EXISTS "Users can update own pro website requests" ON public.pro_website_requests;
DROP POLICY IF EXISTS "Users can delete own pro website requests" ON public.pro_website_requests;

CREATE POLICY "Users can view own pro website requests" ON public.pro_website_requests
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own pro website requests" ON public.pro_website_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own pro website requests" ON public.pro_website_requests
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own pro website requests" ON public.pro_website_requests
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- managed_websites
DROP POLICY IF EXISTS "Users can view own websites" ON public.managed_websites;
DROP POLICY IF EXISTS "Users can create own websites" ON public.managed_websites;
DROP POLICY IF EXISTS "Users can update own websites" ON public.managed_websites;
DROP POLICY IF EXISTS "Users can delete own websites" ON public.managed_websites;

CREATE POLICY "Users can view own websites" ON public.managed_websites
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can create own websites" ON public.managed_websites
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own websites" ON public.managed_websites
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own websites" ON public.managed_websites
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- managed_website_content (uses EXISTS via managed_websites)
DROP POLICY IF EXISTS "Users can view own website content" ON public.managed_website_content;
DROP POLICY IF EXISTS "Users can create own website content" ON public.managed_website_content;
DROP POLICY IF EXISTS "Users can update own website content" ON public.managed_website_content;
DROP POLICY IF EXISTS "Users can delete own website content" ON public.managed_website_content;

CREATE POLICY "Users can view own website content" ON public.managed_website_content
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = managed_website_content.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can create own website content" ON public.managed_website_content
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = managed_website_content.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can update own website content" ON public.managed_website_content
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = managed_website_content.website_id AND managed_websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = managed_website_content.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can delete own website content" ON public.managed_website_content
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = managed_website_content.website_id AND managed_websites.user_id = (select auth.uid())
  ));

-- website_payments (uses EXISTS via managed_websites)
DROP POLICY IF EXISTS "Users can view own website payments" ON public.website_payments;
DROP POLICY IF EXISTS "Users can create own website payments" ON public.website_payments;
DROP POLICY IF EXISTS "Users can update own website payments" ON public.website_payments;
DROP POLICY IF EXISTS "Users can delete own website payments" ON public.website_payments;

CREATE POLICY "Users can view own website payments" ON public.website_payments
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = website_payments.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can create own website payments" ON public.website_payments
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = website_payments.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can update own website payments" ON public.website_payments
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = website_payments.website_id AND managed_websites.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = website_payments.website_id AND managed_websites.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can delete own website payments" ON public.website_payments
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM managed_websites WHERE managed_websites.id = website_payments.website_id AND managed_websites.user_id = (select auth.uid())
  ));

-- marketing_strategies
DROP POLICY IF EXISTS "Users can view own marketing strategies" ON public.marketing_strategies;
DROP POLICY IF EXISTS "Users can insert own marketing strategies" ON public.marketing_strategies;
DROP POLICY IF EXISTS "Users can update own marketing strategies" ON public.marketing_strategies;
DROP POLICY IF EXISTS "Users can delete own marketing strategies" ON public.marketing_strategies;

CREATE POLICY "Users can view own marketing strategies" ON public.marketing_strategies
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own marketing strategies" ON public.marketing_strategies
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own marketing strategies" ON public.marketing_strategies
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own marketing strategies" ON public.marketing_strategies
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- website_setup
DROP POLICY IF EXISTS "Users can view own website setup" ON public.website_setup;
DROP POLICY IF EXISTS "Users can insert own website setup" ON public.website_setup;
DROP POLICY IF EXISTS "Users can update own website setup" ON public.website_setup;
DROP POLICY IF EXISTS "Users can delete own website setup" ON public.website_setup;

CREATE POLICY "Users can view own website setup" ON public.website_setup
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own website setup" ON public.website_setup
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own website setup" ON public.website_setup
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own website setup" ON public.website_setup
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- website_suggestions
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.website_suggestions;
DROP POLICY IF EXISTS "Users can create own suggestions" ON public.website_suggestions;
DROP POLICY IF EXISTS "Users can update own suggestions" ON public.website_suggestions;
DROP POLICY IF EXISTS "Users can delete own suggestions" ON public.website_suggestions;

CREATE POLICY "Users can view own suggestions" ON public.website_suggestions
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can create own suggestions" ON public.website_suggestions
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own suggestions" ON public.website_suggestions
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own suggestions" ON public.website_suggestions
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- website_bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.website_bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.website_bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.website_bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.website_bookings;

CREATE POLICY "Users can view own bookings" ON public.website_bookings
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own bookings" ON public.website_bookings
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own bookings" ON public.website_bookings
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own bookings" ON public.website_bookings
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- first_dollar_progress
DROP POLICY IF EXISTS "Users can view own first dollar progress" ON public.first_dollar_progress;
DROP POLICY IF EXISTS "Users can create own first dollar progress" ON public.first_dollar_progress;
DROP POLICY IF EXISTS "Users can update own first dollar progress" ON public.first_dollar_progress;
DROP POLICY IF EXISTS "Users can delete own first dollar progress" ON public.first_dollar_progress;

CREATE POLICY "Users can view own first dollar progress" ON public.first_dollar_progress
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can create own first dollar progress" ON public.first_dollar_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own first dollar progress" ON public.first_dollar_progress
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own first dollar progress" ON public.first_dollar_progress
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- marketing_playbook
DROP POLICY IF EXISTS "Users can view own playbook entries" ON public.marketing_playbook;
DROP POLICY IF EXISTS "Users can insert own playbook entries" ON public.marketing_playbook;
DROP POLICY IF EXISTS "Users can update own playbook entries" ON public.marketing_playbook;
DROP POLICY IF EXISTS "Users can delete own playbook entries" ON public.marketing_playbook;

CREATE POLICY "Users can view own playbook entries" ON public.marketing_playbook
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own playbook entries" ON public.marketing_playbook
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own playbook entries" ON public.marketing_playbook
  FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own playbook entries" ON public.marketing_playbook
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
