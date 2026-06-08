// AWS CloudWatch and Cost Explorer Integration
import { CloudWatchClient, GetMetricStatisticsCommand, Dimension } from '@aws-sdk/client-cloudwatch'
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2'
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds'

export interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export interface AWSInstance {
  instanceId: string
  instanceType: string
  state: string
  launchTime: Date
  tags: Record<string, string>
}

export interface AWSMetrics {
  instanceId: string
  timestamp: Date
  cpuUtilization: number
  networkIn: number
  networkOut: number
  diskReadOps: number
  diskWriteOps: number
}

export class AWSIntegrationService {
  private cloudWatchClient: CloudWatchClient
  private ec2Client: EC2Client
  private rdsClient: RDSClient

  constructor(credentials: AWSCredentials) {
    const config = {
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    }

    this.cloudWatchClient = new CloudWatchClient(config)
    this.ec2Client = new EC2Client(config)
    this.rdsClient = new RDSClient(config)
  }

  /**
   * Get all EC2 instances
   */
  async getEC2Instances(): Promise<AWSInstance[]> {
    try {
      const command = new DescribeInstancesCommand({})
      const response = await this.ec2Client.send(command)
      
      const instances: AWSInstance[] = []
      
      response.Reservations?.forEach(reservation => {
        reservation.Instances?.forEach(instance => {
          if (instance.InstanceId && instance.InstanceType && instance.State?.Name && instance.LaunchTime) {
            const tags: Record<string, string> = {}
            instance.Tags?.forEach(tag => {
              if (tag.Key && tag.Value) {
                tags[tag.Key] = tag.Value
              }
            })

            instances.push({
              instanceId: instance.InstanceId,
              instanceType: instance.InstanceType,
              state: instance.State.Name,
              launchTime: instance.LaunchTime,
              tags
            })
          }
        })
      })

      return instances
    } catch (error) {
      console.error('Error fetching EC2 instances:', error)
      throw new Error('Failed to fetch EC2 instances')
    }
  }

  /**
   * Get CloudWatch metrics for an EC2 instance
   */
  async getInstanceMetrics(instanceId: string, startTime: Date, endTime: Date): Promise<AWSMetrics[]> {
    try {
      const dimensions: Dimension[] = [
        {
          Name: 'InstanceId',
          Value: instanceId
        }
      ]

      // Get CPU Utilization
      const cpuCommand = new GetMetricStatisticsCommand({
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: dimensions,
        StartTime: startTime,
        EndTime: endTime,
        Period: 300, // 5 minute intervals
        Statistics: ['Average']
      })

      // Get Network In
      const networkInCommand = new GetMetricStatisticsCommand({
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkIn',
        Dimensions: dimensions,
        StartTime: startTime,
        EndTime: endTime,
        Period: 300,
        Statistics: ['Sum']
      })

      // Get Network Out
      const networkOutCommand = new GetMetricStatisticsCommand({
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkOut',
        Dimensions: dimensions,
        StartTime: startTime,
        EndTime: endTime,
        Period: 300,
        Statistics: ['Sum']
      })

      // Execute all commands in parallel
      const [cpuResponse, networkInResponse, networkOutResponse] = await Promise.all([
        this.cloudWatchClient.send(cpuCommand),
        this.cloudWatchClient.send(networkInCommand),
        this.cloudWatchClient.send(networkOutCommand)
      ])

      // Combine metrics by timestamp
      const metricsMap = new Map<string, Partial<AWSMetrics>>()

      // Process CPU metrics
      cpuResponse.Datapoints?.forEach(datapoint => {
        if (datapoint.Timestamp && datapoint.Average !== undefined) {
          const key = datapoint.Timestamp.toISOString()
          if (!metricsMap.has(key)) {
            metricsMap.set(key, {
              instanceId,
              timestamp: datapoint.Timestamp
            })
          }
          const metrics = metricsMap.get(key)!
          metrics.cpuUtilization = datapoint.Average
        }
      })

      // Process Network In metrics
      networkInResponse.Datapoints?.forEach(datapoint => {
        if (datapoint.Timestamp && datapoint.Sum !== undefined) {
          const key = datapoint.Timestamp.toISOString()
          if (!metricsMap.has(key)) {
            metricsMap.set(key, {
              instanceId,
              timestamp: datapoint.Timestamp
            })
          }
          const metrics = metricsMap.get(key)!
          metrics.networkIn = datapoint.Sum
        }
      })

      // Process Network Out metrics
      networkOutResponse.Datapoints?.forEach(datapoint => {
        if (datapoint.Timestamp && datapoint.Sum !== undefined) {
          const key = datapoint.Timestamp.toISOString()
          if (!metricsMap.has(key)) {
            metricsMap.set(key, {
              instanceId,
              timestamp: datapoint.Timestamp
            })
          }
          const metrics = metricsMap.get(key)!
          metrics.networkOut = datapoint.Sum
        }
      })

      // Convert to array and fill missing values
      const metrics: AWSMetrics[] = []
      metricsMap.forEach(metric => {
        if (metric.timestamp) {
          metrics.push({
            instanceId,
            timestamp: metric.timestamp,
            cpuUtilization: metric.cpuUtilization || 0,
            networkIn: metric.networkIn || 0,
            networkOut: metric.networkOut || 0,
            diskReadOps: 0, // Would need additional API call
            diskWriteOps: 0  // Would need additional API call
          })
        }
      })

      return metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    } catch (error) {
      console.error('Error fetching instance metrics:', error)
      throw new Error('Failed to fetch instance metrics')
    }
  }

  /**
   * Get RDS database instances
   */
  async getRDSInstances() {
    try {
      const command = new DescribeDBInstancesCommand({})
      const response = await this.rdsClient.send(command)
      
      return response.DBInstances?.map(db => ({
        identifier: db.DBInstanceIdentifier,
        engine: db.Engine,
        instanceClass: db.DBInstanceClass,
        status: db.DBInstanceStatus,
        allocatedStorage: db.AllocatedStorage,
        endpoint: db.Endpoint?.Address
      })) || []
    } catch (error) {
      console.error('Error fetching RDS instances:', error)
      throw new Error('Failed to fetch RDS instances')
    }
  }

  /**
   * Get real-time instance status
   */
  async getRealTimeInstanceStatus(instanceId: string) {
    try {
      // Get the most recent metrics (last 10 minutes)
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - 10 * 60 * 1000)
      
      const metrics = await this.getInstanceMetrics(instanceId, startTime, endTime)
      
      if (metrics.length === 0) {
        return null
      }

      // Get the latest metric
      const latestMetric = metrics[metrics.length - 1]
      
      // Determine health status based on metrics
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      
      if (latestMetric.cpuUtilization > 90) {
        status = 'critical'
      } else if (latestMetric.cpuUtilization > 80) {
        status = 'warning'
      }

      return {
        instanceId,
        status,
        metrics: latestMetric,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error getting real-time status:', error)
      return null
    }
  }

  /**
   * Get cost data for an instance (requires Cost Explorer API)
   */
  async getInstanceCostData(instanceId: string, startDate: Date, endDate: Date) {
    try {
      // This would require AWS Cost Explorer API
      // For now, return estimated costs based on instance type
      const instances = await this.getEC2Instances()
      const instance = instances.find(i => i.instanceId === instanceId)
      
      if (!instance) {
        throw new Error('Instance not found')
      }

      // Rough cost estimation (would be replaced with actual Cost Explorer data)
      const hourlyCosts: Record<string, number> = {
        't3.micro': 0.0104,
        't3.small': 0.0208,
        't3.medium': 0.0416,
        't3.large': 0.0832,
        't3.xlarge': 0.1664,
        'm5.large': 0.096,
        'm5.xlarge': 0.192,
        'c5.large': 0.085,
        'c5.xlarge': 0.17
      }

      const hourlyCost = hourlyCosts[instance.instanceType] || 0.1
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalCost = hourlyCost * 24 * days

      return {
        instanceId,
        instanceType: instance.instanceType,
        startDate,
        endDate,
        hourlyCost,
        totalCost,
        currency: 'USD'
      }
    } catch (error) {
      console.error('Error getting cost data:', error)
      throw new Error('Failed to get cost data')
    }
  }
}

// Factory function to create AWS integration
export function createAWSIntegration(): AWSIntegrationService | null {
  try {
    const credentials: AWSCredentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
    }

    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      console.warn('AWS credentials not configured, using demo data')
      return null
    }

    return new AWSIntegrationService(credentials)
  } catch (error) {
    console.error('Failed to initialize AWS integration:', error)
    return null
  }
}
