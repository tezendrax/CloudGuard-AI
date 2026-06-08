// Base Cloud Adapter - Abstract class for all cloud providers
import { CloudAccount, CloudResource, Metric } from '@/types'

// Time range interface
export interface TimeRange {
  start: Date
  end: Date
  metricName?: string
}

// Scale configuration interface
export interface ScaleConfig {
  minInstances?: number
  maxInstances?: number
  targetCpuUtilization?: number
  targetMemoryUtilization?: number
  scaleUpCooldown?: number
  scaleDownCooldown?: number
}

// Simplified interface for build stability
export interface ICloudAdapter {
  authenticate(): Promise<boolean>;
  listResources(): Promise<any[]>;
  getMetrics(resourceId: string, timeRange: any): Promise<any[]>;
  applyPolicy(resourceId: string, policy: any): Promise<boolean>;
  getCostData(resourceId: string, startDate: Date, endDate: Date): Promise<number>;
  scaleResource(resourceId: string, config: any): Promise<boolean>;
  startResource(resourceId: string): Promise<boolean>;
}

// Export types for other modules
export type { CloudAccount, CloudResource, Metric }

export abstract class BaseCloudAdapter implements ICloudAdapter {
  protected account: CloudAccount
  protected credentials: any

  constructor(account: CloudAccount) {
    this.account = account
    this.credentials = this.decryptCredentials(account.credentials)
  }

  // Abstract methods that must be implemented by each provider
  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract testConnection(): Promise<boolean>
  abstract listResources(): Promise<CloudResource[]>
  abstract getResource(resourceId: string): Promise<CloudResource | null>
  abstract getMetrics(resourceId: string, timeRange: TimeRange): Promise<Metric[]>
  abstract startResource(resourceId: string): Promise<boolean>
  abstract stopResource(resourceId: string): Promise<boolean>
  abstract deleteResource(resourceId: string): Promise<boolean>
  abstract scaleResource(resourceId: string, config: ScaleConfig): Promise<boolean>
  abstract getResourceCost(resourceId: string, timeRange: TimeRange): Promise<number>
  
  // Required interface methods
  abstract authenticate(): Promise<boolean>
  abstract applyPolicy(resourceId: string, policy: any): Promise<boolean>
  abstract getCostData(resourceId: string, startDate: Date, endDate: Date): Promise<number>

  // Common methods
  protected decryptCredentials(encryptedCredentials: any): any {
    // In a real implementation, this would decrypt the stored credentials
    return encryptedCredentials
  }

  protected formatResource(rawResource: any): CloudResource {
    return {
      id: this.generateResourceId(),
      cloudAccountId: this.account.id,
      externalId: rawResource.id || rawResource.instanceId || rawResource.resourceId,
      name: rawResource.name || rawResource.tags?.Name || 'Unknown',
      type: this.mapResourceType(rawResource.type || rawResource.instanceType),
      status: this.mapResourceStatus(rawResource.state || rawResource.status),
      region: rawResource.region || this.account.region,
      tags: rawResource.tags || {},
      configuration: this.extractConfiguration(rawResource),
      cost: rawResource.cost || 0,
      lastSyncAt: new Date(),
      createdAt: rawResource.createdAt || new Date(),
      updatedAt: new Date(),
    }
  }

  protected mapResourceType(providerType: string): any {
    // Default mapping - override in specific adapters
    const typeMap: Record<string, string> = {
      'instance': 'COMPUTE',
      'volume': 'STORAGE',
      'database': 'DATABASE',
      'vpc': 'NETWORK',
      'security-group': 'SECURITY',
      'function': 'SERVERLESS',
      'container': 'CONTAINER',
    }
    
    return typeMap[providerType.toLowerCase()] || 'OTHER'
  }

  protected mapResourceStatus(providerStatus: string): any {
    // Default mapping - override in specific adapters
    const statusMap: Record<string, string> = {
      'running': 'RUNNING',
      'stopped': 'STOPPED',
      'pending': 'PENDING',
      'terminated': 'TERMINATED',
      'shutting-down': 'PENDING',
      'stopping': 'PENDING',
      'starting': 'PENDING',
      'error': 'ERROR',
      'failed': 'ERROR',
    }
    
    return statusMap[providerStatus.toLowerCase()] || 'UNKNOWN'
  }

  protected extractConfiguration(rawResource: any): Record<string, any> {
    // Extract relevant configuration from raw resource
    return {
      instanceType: rawResource.instanceType,
      imageId: rawResource.imageId,
      keyName: rawResource.keyName,
      securityGroups: rawResource.securityGroups,
      subnetId: rawResource.subnetId,
      availabilityZone: rawResource.availabilityZone,
      ...rawResource.configuration
    }
  }

  protected generateResourceId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Utility methods for metrics
  protected createMetric(
    resourceId: string, 
    name: string, 
    value: number, 
    unit: string, 
    timestamp?: Date,
    tags?: Record<string, any>
  ): Metric {
    return {
      id: this.generateMetricId(),
      cloudAccountId: this.account.id,
      cloudResourceId: resourceId,
      name,
      value,
      unit,
      tags: tags || {},
      timestamp: timestamp || new Date(),
    }
  }

  // Error handling
  protected handleError(error: any, operation: string): never {
    console.error(`${this.account.provider} Adapter Error in ${operation}:`, error)
    throw new Error(`${this.account.provider} operation failed: ${error.message || error}`)
  }

  // Validation
  protected validateCredentials(): boolean {
    return this.credentials && typeof this.credentials === 'object'
  }

  protected validateResourceId(resourceId: string): boolean {
    return typeof resourceId === 'string' && resourceId.length > 0
  }
}

// Supporting types
export interface TimeRange {
  start: Date
  end: Date
  interval?: '1m' | '5m' | '1h' | '1d'
}

export interface ScaleConfig {
  minInstances?: number
  maxInstances?: number
  desiredInstances?: number
  instanceType?: string
  autoScaling?: boolean
}

// Provider-specific error types
export class CloudAdapterError extends Error {
  constructor(
    message: string,
    public provider: string,
    public operation: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'CloudAdapterError'
  }
}

export class ConnectionError extends CloudAdapterError {
  constructor(provider: string, originalError?: any) {
    super(`Failed to connect to ${provider}`, provider, 'connect', originalError)
    this.name = 'ConnectionError'
  }
}

export class ResourceNotFoundError extends CloudAdapterError {
  constructor(provider: string, resourceId: string) {
    super(`Resource ${resourceId} not found in ${provider}`, provider, 'getResource')
    this.name = 'ResourceNotFoundError'
  }
}

export class InsufficientPermissionsError extends CloudAdapterError {
  constructor(provider: string, operation: string) {
    super(`Insufficient permissions for ${operation} in ${provider}`, provider, operation)
    this.name = 'InsufficientPermissionsError'
  }
}
