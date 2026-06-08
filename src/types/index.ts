// CloudGuard AI Type Definitions

// Core Types
export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  settings?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Cloud Infrastructure Types
export interface CloudAccount {
  id: string
  organizationId: string
  name: string
  provider: CloudProvider
  credentials: Record<string, any>
  region: string
  status: AccountStatus
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CloudResource {
  id: string
  cloudAccountId: string
  externalId: string
  name: string
  type: ResourceType
  status: ResourceStatus
  region: string
  tags?: Record<string, any>
  configuration: Record<string, any>
  cost?: number
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Digital Twin Types
export interface DigitalTwin {
  id: string
  organizationId: string
  cloudAccountId: string
  cloudResourceId?: string
  name: string
  type: TwinType
  state: Record<string, any>
  predictedState?: Record<string, any>
  lastSimulation?: Date
  accuracy?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Simulation {
  id: string
  digitalTwinId: string
  scenario: string
  parameters: Record<string, any>
  results: Record<string, any>
  duration: number
  status: SimulationStatus
  startedAt: Date
  completedAt?: Date
}

export interface Prediction {
  id: string
  digitalTwinId: string
  type: PredictionType
  timeframe: number
  confidence: number
  prediction: Record<string, any>
  actualOutcome?: Record<string, any>
  status: PredictionStatus
  createdAt: Date
  validatedAt?: Date
}

// Monitoring Types
export interface Metric {
  id: string
  cloudAccountId: string
  cloudResourceId?: string
  name: string
  value: number
  unit: string
  tags?: Record<string, any>
  timestamp: Date
}

export interface Alert {
  id: string
  cloudResourceId: string
  name: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  conditions: Record<string, any>
  actions?: Record<string, any>
  triggeredAt: Date
  resolvedAt?: Date
  acknowledgedAt?: Date
}

// Policy & Automation Types
export interface Policy {
  id: string
  organizationId: string
  name: string
  description: string
  type: PolicyType
  conditions: Record<string, any>
  actions: Record<string, any>
  isActive: boolean
  priority: number
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface PolicyExecution {
  id: string
  policyId: string
  status: ExecutionStatus
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
  startedAt: Date
  completedAt?: Date
}

// Security Types
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: AlertSeverity
  source: string
  description: string
  metadata: Record<string, any>
  status: AlertStatus
  detectedAt: Date
  resolvedAt?: Date
}

// Cost Management Types
export interface CostAnalysis {
  id: string
  cloudAccountId: string
  resourceType?: string
  service: string
  actualCost: number
  predictedCost?: number
  optimizedCost?: number
  savings?: number
  currency: string
  period: string
  date: Date
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Types
export interface DashboardMetrics {
  totalResources: number
  activeAlerts: number
  costSavings: number
  uptime: number
  predictiveAccuracy: number
  digitalTwins: number
}

export interface CloudProviderStats {
  provider: CloudProvider
  resources: number
  cost: number
  alerts: number
  uptime: number
}

export interface TimeSeriesData {
  timestamp: Date
  value: number
  label?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: Date
}

export interface RealTimeUpdate {
  type: 'metric' | 'alert' | 'resource' | 'prediction'
  data: any
  resourceId?: string
  accountId?: string
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum CloudProvider {
  AWS = 'AWS',
  AZURE = 'AZURE',
  GCP = 'GCP',
  MULTI_CLOUD = 'MULTI_CLOUD',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

export enum ResourceType {
  COMPUTE = 'COMPUTE',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  SECURITY = 'SECURITY',
  ANALYTICS = 'ANALYTICS',
  CONTAINER = 'CONTAINER',
  SERVERLESS = 'SERVERLESS',
  OTHER = 'OTHER',
}

export enum ResourceStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  PENDING = 'PENDING',
  TERMINATED = 'TERMINATED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

export enum TwinType {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  APPLICATION = 'APPLICATION',
  SECURITY = 'SECURITY',
  COST = 'COST',
  PERFORMANCE = 'PERFORMANCE',
}

export enum SimulationStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PredictionType {
  PERFORMANCE = 'PERFORMANCE',
  COST = 'COST',
  SECURITY = 'SECURITY',
  FAILURE = 'FAILURE',
  SCALING = 'SCALING',
}

export enum PredictionStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  SUPPRESSED = 'SUPPRESSED',
}

export enum PolicyType {
  SECURITY = 'SECURITY',
  COST_OPTIMIZATION = 'COST_OPTIMIZATION',
  SCALING = 'SCALING',
  COMPLIANCE = 'COMPLIANCE',
  BACKUP = 'BACKUP',
  MONITORING = 'MONITORING',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum SecurityEventType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH = 'DATA_BREACH',
  MALWARE = 'MALWARE',
  VULNERABILITY = 'VULNERABILITY',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  ANOMALY = 'ANOMALY',
}
