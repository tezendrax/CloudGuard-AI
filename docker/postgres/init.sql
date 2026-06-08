-- CloudGuard AI Database Initialization
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS cloudguard;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Set default search path
ALTER DATABASE cloudguard_ai SET search_path TO cloudguard, analytics, monitoring, public;

-- Create initial admin user (will be managed by Prisma later)
-- This is just for initial setup
