# Supabase Setup Guide - Scout Dashboard

## Phase E: Backend Readiness

This guide covers the complete Supabase configuration, database schema setup, RPC functions, and connection testing for the Scout Dashboard application.

---

## 1. Initial Supabase Setup

### Prerequisites
- Supabase account (https://supabase.com)
- - PostgreSQL knowledge (basic)
  - - Postman or similar API testing tool (optional)
   
    - ### Step 1: Create Supabase Project
    - 1. Go to https://supabase.com/dashboard
      2. 2. Click "New Project"
         3. 3. Fill in project details:
            4.    - **Project Name:** `scout-dashboard` (or similar)
                  -    - **Database Password:** Use strong password (save securely)
                       -    - **Region:** Select closest to your users (e.g., Singapore for TBWA Philippines)
                            - 4. Click "Create new project"
                              5. 5. Wait for initialization (5-10 minutes)
                                
                                 6. ### Step 2: Get Connection Credentials
                                 7. Once project is ready:
                                 8. 1. Go to **Settings → Database**
                                    2. 2. Copy these values and add to `.env.local`:
                                       3.    ```bash
                                                NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
                                                NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
                                                SUPABASE_SERVICE_KEY=<your-service-role-key>  # Keep private!
                                                ```

                                             ---

                                         ## 2. Database Schema Setup

                                       ### Step 1: Enable Real-time on Tables
                                       In Supabase Dashboard:
                                       1. Go to **Replication** (under Settings)
                                       2. 2. Enable replication for tables you want real-time updates
                                          3. 3. Specifically enable:
                                             4.    - `scout_gold_transactions_flat`
                                                   -    - Any other transaction tables
                                                    
                                                        - ### Step 2: Create Core Table Schema
                                                        - Run these SQL migrations in Supabase SQL Editor:
                                                    
                                                        - ```sql
                                                          -- Scout Gold Transactions Table (Primary Data Table)
                                                          CREATE TABLE IF NOT EXISTS scout_gold_transactions_flat (
                                                            id BIGSERIAL PRIMARY KEY,
                                                            transaction_id UUID UNIQUE NOT NULL,
                                                            date DATE NOT NULL,
                                                            amount DECIMAL(12, 2) NOT NULL,
                                                            currency VARCHAR(3) DEFAULT 'PHP',

                                                            -- Category & Product Info
                                                            product_category VARCHAR(255),
                                                            product_subcategory VARCHAR(255),
                                                            product_name VARCHAR(255),
                                                            brand_name VARCHAR(255),

                                                            -- Geographic Info
                                                            region VARCHAR(100),
                                                            province VARCHAR(100),
                                                            city VARCHAR(100),
                                                            latitude DECIMAL(10, 8),
                                                            longitude DECIMAL(11, 8),

                                                            -- Agency Info
                                                            agency_code VARCHAR(50),
                                                            agency_name VARCHAR(255),
                                                            channel_type VARCHAR(50),

                                                            -- Performance Metrics
                                                            units_sold INTEGER DEFAULT 0,
                                                            discount_percent DECIMAL(5, 2) DEFAULT 0,
                                                            margin_amount DECIMAL(12, 2),

                                                            -- System Fields
                                                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                            data_source VARCHAR(50) DEFAULT 'source_system'
                                                          );

                                                          -- Create Indexes for Performance
                                                          CREATE INDEX idx_scout_date ON scout_gold_transactions_flat(date DESC);
                                                          CREATE INDEX idx_scout_region ON scout_gold_transactions_flat(region);
                                                          CREATE INDEX idx_scout_category ON scout_gold_transactions_flat(product_category);
                                                          CREATE INDEX idx_scout_agency ON scout_gold_transactions_flat(agency_code);
                                                          CREATE INDEX idx_scout_amount ON scout_gold_transactions_flat(amount);

                                                          -- Add Comments
                                                          COMMENT ON TABLE scout_gold_transactions_flat IS 'Primary data table for Scout Dashboard containing flattened transaction data';
                                                          COMMENT ON COLUMN scout_gold_transactions_flat.date IS 'Transaction date in YYYY-MM-DD format';
                                                          COMMENT ON COLUMN scout_gold_transactions_flat.amount IS 'Transaction amount in PHP or specified currency';
                                                          ```

                                                          ### Step 3: Verify Table Creation
                                                          In SQL Editor, run:
                                                          ```sql
                                                          SELECT table_name FROM information_schema.tables
                                                          WHERE table_schema = 'public' AND table_name = 'scout_gold_transactions_flat';
                                                          ```

                                                          Should return: `scout_gold_transactions_flat`

                                                          ---

                                                          ## 3. Real-time Configuration

                                                          ### Enable Real-time for Tables
                                                          Run in SQL Editor:
                                                          ```sql
                                                          -- Enable real-time for scout_gold_transactions_flat
                                                          ALTER PUBLICATION supabase_realtime ADD TABLE scout_gold_transactions_flat;

                                                          -- Verify publication
                                                          SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
                                                          ```

                                                          ### Test Real-time Connection
                                                          Use the provided test in `/scripts/test-realtime.ts`:
                                                          ```bash
                                                          pnpm exec ts-node scripts/test-realtime.ts
                                                          ```

                                                          ---

                                                          ## 4. RPC Functions Setup

                                                          ### Step 1: Create RPC Functions

                                                          #### Function 1: Get Category Summary
                                                          ```sql
                                                          CREATE OR REPLACE FUNCTION get_category_summary(
                                                            start_date DATE,
                                                            end_date DATE
                                                          )
                                                          RETURNS TABLE (
                                                            category VARCHAR,
                                                            total_amount DECIMAL,
                                                            unit_count BIGINT,
                                                            transaction_count BIGINT,
                                                            avg_transaction DECIMAL
                                                          ) AS $$
                                                          SELECT
                                                            product_category,
                                                            SUM(amount)::DECIMAL,
                                                            SUM(units_sold)::BIGINT,
                                                            COUNT(*)::BIGINT,
                                                            AVG(amount)::DECIMAL
                                                          FROM scout_gold_transactions_flat
                                                          WHERE date BETWEEN start_date AND end_date
                                                          GROUP BY product_category
                                                          ORDER BY total_amount DESC;
                                                          $$ LANGUAGE sql STABLE;
                                                          ```

                                                          #### Function 2: Get Geographic Summary
                                                          ```sql
                                                          CREATE OR REPLACE FUNCTION get_geographic_summary(
                                                            start_date DATE,
                                                            end_date DATE,
                                                            region_filter VARCHAR DEFAULT NULL
                                                          )
                                                          RETURNS TABLE (
                                                            region VARCHAR,
                                                            total_amount DECIMAL,
                                                            transaction_count BIGINT,
                                                            avg_amount DECIMAL,
                                                            center_lat DECIMAL,
                                                            center_lng DECIMAL
                                                          ) AS $$
                                                          SELECT
                                                            region,
                                                            SUM(amount)::DECIMAL,
                                                            COUNT(*)::BIGINT,
                                                            AVG(amount)::DECIMAL,
                                                            AVG(latitude)::DECIMAL,
                                                            AVG(longitude)::DECIMAL
                                                          FROM scout_gold_transactions_flat
                                                          WHERE date BETWEEN start_date AND end_date
                                                            AND (region_filter IS NULL OR region = region_filter)
                                                          GROUP BY region
                                                          ORDER BY total_amount DESC;
                                                          $$ LANGUAGE sql STABLE;
                                                          ```

                                                          #### Function 3: Get Time Series Data
                                                          ```sql
                                                          CREATE OR REPLACE FUNCTION get_time_series(
                                                            start_date DATE,
                                                            end_date DATE,
                                                            granularity VARCHAR DEFAULT 'daily'
                                                          )
                                                          RETURNS TABLE (
                                                            period DATE,
                                                            total_amount DECIMAL,
                                                            transaction_count BIGINT
                                                          ) AS $$
                                                          BEGIN
                                                            IF granularity = 'daily' THEN
                                                              RETURN QUERY
                                                              SELECT
                                                                date,
                                                                SUM(amount)::DECIMAL,
                                                                COUNT(*)::BIGINT
                                                              FROM scout_gold_transactions_flat
                                                              WHERE date BETWEEN start_date AND end_date
                                                              GROUP BY date
                                                              ORDER BY date DESC;
                                                            ELSIF granularity = 'monthly' THEN
                                                              RETURN QUERY
                                                              SELECT
                                                                DATE_TRUNC('month', date)::DATE,
                                                                SUM(amount)::DECIMAL,
                                                                COUNT(*)::BIGINT
                                                              FROM scout_gold_transactions_flat
                                                              WHERE date BETWEEN start_date AND end_date
                                                              GROUP BY DATE_TRUNC('month', date)
                                                              ORDER BY DATE_TRUNC('month', date) DESC;
                                                            END IF;
                                                          END;
                                                          $$ LANGUAGE plpgsql STABLE;
                                                          ```

                                                          ### Step 2: Grant Permissions
                                                          ```sql
                                                          -- Grant execute permissions to anon role (for API access)
                                                          GRANT EXECUTE ON FUNCTION get_category_summary(DATE, DATE) TO anon;
                                                          GRANT EXECUTE ON FUNCTION get_geographic_summary(DATE, DATE, VARCHAR) TO anon;
                                                          GRANT EXECUTE ON FUNCTION get_time_series(DATE, DATE, VARCHAR) TO anon;
                                                          ```

                                                          ### Step 3: Verify RPC Functions
                                                          In SQL Editor:
                                                          ```sql
                                                          SELECT routine_name FROM information_schema.routines
                                                          WHERE routine_type = 'FUNCTION' AND routine_schema = 'public'
                                                          ORDER BY routine_name;
                                                          ```

                                                          Should show:
                                                          - `get_category_summary`
                                                          - - `get_geographic_summary`
                                                            - - `get_time_series`
                                                             
                                                              - ---

                                                              ## 5. Connection Testing

                                                              ### Step 1: Test Supabase Connection from App

                                                              Update `lib/supabaseClient.ts`:
                                                              ```typescript
                                                              import { createClient } from '@supabase/supabase-js'

                                                              const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                                                              const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

                                                              if (!supabaseUrl || !supabaseAnonKey) {
                                                                throw new Error('Missing Supabase environment variables')
                                                              }

                                                              export const supabase = createClient(supabaseUrl, supabaseAnonKey)

                                                              export function getSupabase() {
                                                                return supabase
                                                              }
                                                              ```

                                                              ### Step 2: Create Test Script
                                                              Create `scripts/test-supabase.ts`:
                                                              ```typescript
                                                              import { createClient } from '@supabase/supabase-js'

                                                              const supabase = createClient(
                                                                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                                                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                                                              )

                                                              async function testConnection() {
                                                                try {
                                                                  console.log('Testing Supabase connection...')

                                                                  // Test 1: Simple query
                                                                  const { data, error } = await supabase
                                                                    .from('scout_gold_transactions_flat')
                                                                    .select('count')
                                                                    .limit(1)

                                                                  if (error) throw error
                                                                  console.log('✅ Table query successful')

                                                                  // Test 2: RPC function
                                                                  const { data: rpcData, error: rpcError } = await supabase
                                                                    .rpc('get_category_summary', {
                                                                      start_date: '2025-01-01',
                                                                      end_date: '2025-01-31'
                                                                    })

                                                                  if (rpcError) throw rpcError
                                                                  console.log('✅ RPC function successful')
                                                                  console.log('Categories:', rpcData?.length || 0)

                                                                  // Test 3: Real-time subscription
                                                                  const channel = supabase
                                                                    .channel('scout-test')
                                                                    .on(
                                                                      'postgres_changes',
                                                                      { event: '*', schema: 'public', table: 'scout_gold_transactions_flat' },
                                                                      (payload) => {
                                                                        console.log('✅ Real-time update received:', payload)
                                                                      }
                                                                    )
                                                                    .subscribe()

                                                                  console.log('✅ All tests passed!')
                                                                  await new Promise(resolve => setTimeout(resolve, 2000))
                                                                  channel.unsubscribe()

                                                                } catch (error) {
                                                                  console.error('❌ Test failed:', error)
                                                                  process.exit(1)
                                                                }
                                                              }

                                                              testConnection()
                                                              ```

                                                              Run with:
                                                              ```bash
                                                              pnpm ts-node scripts/test-supabase.ts
                                                              ```

                                                              ### Step 3: Check Test Results
                                                              Expected output:
                                                              ```
                                                              Testing Supabase connection...
                                                              ✅ Table query successful
                                                              ✅ RPC function successful
                                                              Categories: X
                                                              ✅ Real-time update received
                                                              ✅ All tests passed!
                                                              ```

                                                              ---

                                                              ## 6. Row Level Security (RLS)

                                                              ### Optional: Enable RLS for Security
                                                              ```sql
                                                              -- Enable RLS on tables
                                                              ALTER TABLE scout_gold_transactions_flat ENABLE ROW LEVEL SECURITY;

                                                              -- Allow public read access (modify as needed for your security model)
                                                              CREATE POLICY "Enable read access for all users"
                                                                ON scout_gold_transactions_flat FOR SELECT
                                                                USING (true);

                                                              -- Restrict write access to service role only
                                                              CREATE POLICY "Enable insert/update for service role only"
                                                                ON scout_gold_transactions_flat FOR ALL
                                                                USING (auth.role() = 'service_role')
                                                                WITH CHECK (auth.role() = 'service_role');
                                                              ```

                                                              ---

                                                              ## 7. Performance Optimization

                                                              ### Monitor Query Performance
                                                              In Supabase Dashboard:
                                                              1. Go to **Database → Query Performance**
                                                              2. 2. Check slow queries
                                                                 3. 3. Optimize with additional indexes if needed
                                                                   
                                                                    4. ### Common Performance Issues & Solutions
                                                                    5. - **Slow geographic queries:** Add index on `region` and `date`
                                                                       - - **Large result sets:** Implement pagination in API routes
                                                                         - - **Real-time lag:** Monitor connection pool and optimize RPC functions
                                                                          
                                                                           - ---

                                                                           ## 8. Troubleshooting

                                                                           ### Connection Issues
                                                                           ```
                                                                           Error: Could not connect to Supabase
                                                                           ```
                                                                           **Solution:** Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

                                                                           ### RPC Function Not Found
                                                                           ```
                                                                           Error: function get_category_summary does not exist
                                                                           ```
                                                                           **Solution:** Run the SQL migration in Supabase SQL Editor

                                                                           ### Real-time Not Working
                                                                           ```
                                                                           Realtime connection status: CHANNEL_ERROR
                                                                           ```
                                                                           **Solution:** Verify table is in replication publication (Step 2.2)

                                                                           ---

                                                                           ## 9. Verification Checklist

                                                                           - [ ] Supabase project created
                                                                           - [ ] - [ ] Connection credentials saved to .env.local
                                                                           - [ ] - [ ] Database tables created
                                                                           - [ ] - [ ] Indexes created
                                                                           - [ ] - [ ] Real-time enabled
                                                                           - [ ] - [ ] RPC functions created
                                                                           - [ ] - [ ] Permissions granted
                                                                           - [ ] - [ ] Test script runs successfully
                                                                           - [ ] - [ ] Real-time subscriptions working
                                                                           - [ ] - [ ] All RPC functions callable
                                                                          
                                                                           - [ ] ---
                                                                          
                                                                           - [ ] ## 10. Next Steps
                                                                          
                                                                           - [ ] 1. Import sample data (if available)
                                                                           - [ ] 2. Run migration scripts
                                                                           - [ ] 3. Test API routes
                                                                           - [ ] 4. Deploy to Vercel
                                                                           - [ ] 5. Monitor production logs
                                                                          
                                                                           - [ ] ---
                                                                          
                                                                           - [ ] **Last Updated:** 2025-01-04
                                                                           - [ ] **Status:** Phase E - Setup Documentation Complete
