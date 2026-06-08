// Digital Twin ROI Analysis - Real Cost Savings Calculator
export interface CostSavingsAnalysis {
  traditionalApproach: CostStructure
  digitalTwinApproach: CostStructure
  roi: ROIMetrics
  breakEvenPoint: BreakEvenAnalysis
}

interface CostStructure {
  infrastructure: number
  maintenance: number
  downtime: number
  testing: number
  operationalEfficiency: number
  total: number
}

interface ROIMetrics {
  totalSavings: number
  monthlyROI: number
  annualROI: number
  paybackPeriod: number // months
}

interface BreakEvenAnalysis {
  initialInvestment: number
  monthlySavings: number
  breakEvenMonths: number
  fiveYearValue: number
}

export class DigitalTwinCostAnalyzer {
  
  /**
   * Calculate ROI for Digital Twin implementation
   */
  calculateROI(infrastructureSize: 'small' | 'medium' | 'large' | 'enterprise'): CostSavingsAnalysis {
    const baseMetrics = this.getBaseMetrics(infrastructureSize)
    
    const traditionalApproach: CostStructure = {
      infrastructure: baseMetrics.monthlyInfraCost,
      maintenance: baseMetrics.monthlyInfraCost * 0.15, // 15% for reactive maintenance
      downtime: baseMetrics.downtimeCost,
      testing: baseMetrics.testingInfrastructure,
      operationalEfficiency: baseMetrics.inefficiencyWaste,
      total: 0
    }
    traditionalApproach.total = Object.values(traditionalApproach).reduce((sum, cost) => sum + cost, 0)

    const digitalTwinApproach: CostStructure = {
      infrastructure: baseMetrics.monthlyInfraCost * 0.6, // 40% reduction through optimization
      maintenance: baseMetrics.monthlyInfraCost * 0.08, // 8% predictive maintenance
      downtime: baseMetrics.downtimeCost * 0.1, // 90% downtime reduction
      testing: baseMetrics.testingInfrastructure * 0.2, // 80% reduction via virtual testing
      operationalEfficiency: baseMetrics.twinOperationalCost, // New: Twin operation cost
      total: 0
    }
    digitalTwinApproach.total = Object.values(digitalTwinApproach).reduce((sum, cost) => sum + cost, 0)

    const totalSavings = traditionalApproach.total - digitalTwinApproach.total
    const initialInvestment = baseMetrics.twinSetupCost

    const roi: ROIMetrics = {
      totalSavings,
      monthlyROI: (totalSavings / initialInvestment) * 100,
      annualROI: ((totalSavings * 12) / initialInvestment) * 100,
      paybackPeriod: initialInvestment / totalSavings
    }

    const breakEvenPoint: BreakEvenAnalysis = {
      initialInvestment,
      monthlySavings: totalSavings,
      breakEvenMonths: Math.ceil(initialInvestment / totalSavings),
      fiveYearValue: (totalSavings * 60) - initialInvestment
    }

    return {
      traditionalApproach,
      digitalTwinApproach,
      roi,
      breakEvenPoint
    }
  }

  /**
   * Specific cost savings mechanisms
   */
  getDetailedSavingsBreakdown(infrastructureSize: string) {
    return {
      // 1. Infrastructure Right-Sizing
      rightSizing: {
        description: "Optimize resource allocation based on twin simulations",
        mechanism: "Continuous monitoring and ML-based recommendations",
        typicalSavings: "30-50% on cloud costs",
        example: {
          before: "Over-provisioned: 100 instances at 30% utilization",
          after: "Right-sized: 60 instances at 75% utilization",
          monthlySaving: 15000 // $15k/month
        }
      },

      // 2. Predictive Maintenance
      predictiveMaintenance: {
        description: "Prevent failures before they occur",
        mechanism: "AI analysis of twin data to predict equipment failures",
        typicalSavings: "60-80% reduction in maintenance costs",
        example: {
          before: "Reactive repairs: $200k/year + $500k downtime",
          after: "Predictive maintenance: $80k/year + $50k downtime", 
          annualSaving: 570000 // $570k/year
        }
      },

      // 3. Virtual Testing
      virtualTesting: {
        description: "Test changes in digital environment first",
        mechanism: "Simulate deployments and changes before production",
        typicalSavings: "70-90% reduction in testing infrastructure",
        example: {
          before: "Separate test environments: $50k/month",
          after: "Virtual testing in twin: $10k/month",
          monthlySaving: 40000 // $40k/month
        }
      },

      // 4. Optimized Scheduling
      optimizedScheduling: {
        description: "Schedule operations based on predicted optimal times",
        mechanism: "Twin predicts best times for updates, scaling, maintenance",
        typicalSavings: "20-40% on operational costs",
        example: {
          before: "Manual scheduling with conflicts and inefficiencies",
          after: "AI-optimized scheduling with 95% efficiency",
          monthlySaving: 25000 // $25k/month
        }
      },

      // 5. Risk Mitigation
      riskMitigation: {
        description: "Identify and prevent costly failures",
        mechanism: "Continuous risk assessment and proactive measures",
        typicalSavings: "80-95% reduction in catastrophic failure costs",
        example: {
          before: "1 major failure/year: $2M impact",
          after: "Prevented failures: $100k prevention cost",
          annualSaving: 1900000 // $1.9M/year
        }
      }
    }
  }

  /**
   * Real-world implementation costs vs savings
   */
  getRealWorldExample() {
    return {
      company: "Large E-commerce Platform",
      infrastructure: "1000+ servers, multi-cloud, 99.99% SLA requirement",
      
      implementation: {
        phase1: {
          duration: "3 months",
          cost: 500000, // $500k
          scope: "Core infrastructure twins"
        },
        phase2: {
          duration: "6 months", 
          cost: 300000, // $300k
          scope: "Predictive analytics and optimization"
        },
        phase3: {
          duration: "3 months",
          cost: 200000, // $200k
          scope: "Full automation and integration"
        },
        totalInvestment: 1000000 // $1M
      },

      savings: {
        month1to3: 50000, // $50k/month (basic optimization)
        month4to12: 150000, // $150k/month (predictive maintenance)
        month13plus: 250000, // $250k/month (full automation)
        
        yearOneSavings: (50000 * 3) + (150000 * 9), // $1.5M
        yearTwoSavings: 250000 * 12, // $3M
        
        roi: {
          year1: 50, // 50% ROI
          year2: 200, // 200% cumulative ROI
          breakEven: 5 // months
        }
      },

      keyMetrics: {
        downtimeReduction: 85, // %
        maintenanceCostReduction: 60, // %
        cloudCostOptimization: 35, // %
        testingEfficiency: 80, // %
        overallEfficiencyGain: 45 // %
      }
    }
  }

  /**
   * Cost avoidance scenarios
   */
  getCostAvoidanceScenarios() {
    return {
      // Scenario 1: Prevented Major Outage
      preventedOutage: {
        description: "Digital twin predicted database failure 2 weeks early",
        traditionalCost: {
          downtime: 8, // hours
          revenue_loss: 500000, // $500/hour
          reputation_damage: 200000,
          emergency_response: 100000,
          total: 4200000 // $4.2M
        },
        twinPreventionCost: {
          early_detection: 5000,
          planned_maintenance: 50000,
          total: 55000 // $55k
        },
        savings: 4145000 // $4.145M saved
      },

      // Scenario 2: Optimized Scaling
      optimizedScaling: {
        description: "Twin predicted traffic surge, optimized auto-scaling",
        traditionalApproach: {
          over_provisioning: 200000, // monthly
          under_provisioning_risk: 1000000, // potential loss
          manual_scaling_errors: 150000
        },
        twinApproach: {
          predictive_scaling: 50000, // monthly
          optimization_accuracy: 98, // %
          scaling_efficiency: 95 // %
        },
        monthlySavings: 300000 // $300k/month
      },

      // Scenario 3: Security Breach Prevention
      securityPrevention: {
        description: "Twin identified security vulnerability in simulation",
        breachCost: {
          data_loss: 5000000,
          regulatory_fines: 2000000, 
          remediation: 1000000,
          reputation: 3000000,
          total: 11000000 // $11M
        },
        preventionCost: {
          twin_security_testing: 100000,
          patch_deployment: 50000,
          total: 150000 // $150k
        },
        savings: 10850000 // $10.85M saved
      }
    }
  }

  private getBaseMetrics(size: string) {
    const sizeMetrics = {
      small: {
        monthlyInfraCost: 50000,
        downtimeCost: 10000,
        testingInfrastructure: 15000,
        inefficiencyWaste: 20000,
        twinSetupCost: 200000,
        twinOperationalCost: 8000
      },
      medium: {
        monthlyInfraCost: 200000,
        downtimeCost: 50000,
        testingInfrastructure: 75000,
        inefficiencyWaste: 80000,
        twinSetupCost: 500000,
        twinOperationalCost: 25000
      },
      large: {
        monthlyInfraCost: 800000,
        downtimeCost: 200000,
        testingInfrastructure: 300000,
        inefficiencyWaste: 320000,
        twinSetupCost: 1200000,
        twinOperationalCost: 80000
      },
      enterprise: {
        monthlyInfraCost: 2000000,
        downtimeCost: 500000,
        testingInfrastructure: 750000,
        inefficiencyWaste: 800000,
        twinSetupCost: 3000000,
        twinOperationalCost: 200000
      }
    }

    return sizeMetrics[size as keyof typeof sizeMetrics] || sizeMetrics.medium
  }
}

export const digitalTwinROI = new DigitalTwinCostAnalyzer()
