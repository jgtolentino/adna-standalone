-- Enable Row Level Security on creative_ops schema tables
-- This migration adds RLS policies to protect client data
-- Author: TBWA Enterprise Platform
-- Date: 2025-12-06

-- =============================================================================
-- ENABLE RLS ON ALL CREATIVE_OPS TABLES
-- =============================================================================

ALTER TABLE creative_ops.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ops.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ops.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ops.palette_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ops.warc_cases ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR creative_ops.campaigns
-- Campaigns are the top-level entity; users see campaigns they have access to
-- =============================================================================

-- Authenticated users can view all campaigns (read-only access)
CREATE POLICY "Authenticated users can view campaigns"
  ON creative_ops.campaigns FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete campaigns
CREATE POLICY "Service role manages campaigns"
  ON creative_ops.campaigns FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- RLS POLICIES FOR creative_ops.assets
-- Assets belong to campaigns; access follows campaign access
-- =============================================================================

-- Authenticated users can view all assets
CREATE POLICY "Authenticated users can view assets"
  ON creative_ops.assets FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert assets
CREATE POLICY "Authenticated users can insert assets"
  ON creative_ops.assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role can manage all assets
CREATE POLICY "Service role manages assets"
  ON creative_ops.assets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- RLS POLICIES FOR creative_ops.prompts
-- Prompts are queries against assets
-- =============================================================================

-- Authenticated users can view all prompts
CREATE POLICY "Authenticated users can view prompts"
  ON creative_ops.prompts FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create prompts
CREATE POLICY "Authenticated users can create prompts"
  ON creative_ops.prompts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role can manage all prompts
CREATE POLICY "Service role manages prompts"
  ON creative_ops.prompts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- RLS POLICIES FOR creative_ops.palette_analysis
-- Analysis results linked to assets
-- =============================================================================

-- Authenticated users can view palette analysis
CREATE POLICY "Authenticated users can view palette analysis"
  ON creative_ops.palette_analysis FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage palette analysis
CREATE POLICY "Service role manages palette analysis"
  ON creative_ops.palette_analysis FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- RLS POLICIES FOR creative_ops.warc_cases
-- WARC effectiveness case studies - read-only for users
-- =============================================================================

-- Authenticated users can view WARC cases
CREATE POLICY "Authenticated users can view warc cases"
  ON creative_ops.warc_cases FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can view WARC cases (public effectiveness data)
CREATE POLICY "Anonymous users can view warc cases"
  ON creative_ops.warc_cases FOR SELECT
  TO anon
  USING (true);

-- Service role can manage WARC cases
CREATE POLICY "Service role manages warc cases"
  ON creative_ops.warc_cases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- GRANT STATEMENTS (ensure proper access)
-- =============================================================================

-- Ensure authenticated role can access the schema and tables
GRANT USAGE ON SCHEMA creative_ops TO authenticated, anon, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA creative_ops TO authenticated, anon;
GRANT INSERT, UPDATE ON creative_ops.assets, creative_ops.prompts TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA creative_ops TO service_role;

-- Grant sequence access for inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA creative_ops TO authenticated, service_role;

-- Add comment for documentation
COMMENT ON POLICY "Authenticated users can view campaigns" ON creative_ops.campaigns
  IS 'RLS: Allow authenticated users to view all campaigns';
COMMENT ON POLICY "Authenticated users can view assets" ON creative_ops.assets
  IS 'RLS: Allow authenticated users to view all creative assets';
