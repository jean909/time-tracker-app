// Quick setup script pentru Supabase
const SUPABASE_URL = 'https://dlaehmgpmnphzmeexidm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYWVobWdwbW5waHptZWV4aWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzY2MzEsImV4cCI6MjA3MTM1MjYzMX0.XHRJY7yXWmNnSkndle2ud0EFlr2c8Xhi-7Au9zrZ250';

// Service key pentru admin operations (doar pentru setup)
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYWVobWdwbW5waHptZWV4aWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc3NjYzMSwiZXhwIjoyMDcxMzUyNjMxfQ.NuWhBTLKXtau-ckeBvw884fD9oVhv5T_qf6l9wd1-us';

async function setupDatabase() {
  console.log('🚀 Starting Supabase setup...');

  // SQL pentru setup complet
  const setupSQL = `
-- 1. Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Time tracking sessions  
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Events log
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for simplicity)
DROP POLICY IF EXISTS "Allow all operations on employees" ON employees;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;  
DROP POLICY IF EXISTS "Allow all operations on events" ON events;

CREATE POLICY "Allow all operations on employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);

-- Sample data
INSERT INTO employees (name) VALUES 
    ('Andrei'),
    ('Maria'), 
    ('Ioana')
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_employee_id ON sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_events_employee_id ON events(employee_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
`;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: setupSQL
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Database setup complete!');
    
    // Test connection
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (testResponse.ok) {
      const employees = await testResponse.json();
      console.log('✅ Connection test successful!');
      console.log('📊 Sample employees:', employees);
      console.log('🎉 Setup complete! Your app is ready to use the database.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to https://dlaehmgpmnphzmeexidm.supabase.co');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy-paste the content from database/setup.sql');
    console.log('4. Click RUN');
  }
}

// Run setup
setupDatabase();