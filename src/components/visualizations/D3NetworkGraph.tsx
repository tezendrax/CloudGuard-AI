// Advanced D3.js Network Visualization for Digital Twins
'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'

interface Node {
  id: string
  name: string
  type: 'compute' | 'database' | 'storage' | 'network' | 'twin'
  status: 'healthy' | 'warning' | 'critical'
  metrics: {
    cpu?: number
    memory?: number
    connections?: number
    utilization?: number
  }
  predictions?: {
    risk_score: number
    next_failure_probability: number
    cost_trend: 'up' | 'down' | 'stable'
  }
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string | Node
  target: string | Node
  type: 'dependency' | 'data_flow' | 'network' | 'twin_sync'
  strength: number
  bandwidth?: number
}

interface D3NetworkGraphProps {
  nodes: Node[]
  links: Link[]
  onNodeClick?: (node: Node) => void
  onNodeHover?: (node: Node | null) => void
}

export function D3NetworkGraph({ 
  nodes, 
  links, 
  onNodeClick, 
  onNodeHover 
}: D3NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return

    const svg = d3.select(svgRef.current)
    const width = 800
    const height = 600

    // Clear previous content
    svg.selectAll("*").remove()

    // Create main group for zooming
    const g = svg.append("g")

    // Define gradients and patterns
    const defs = svg.append("defs")
    
    // Gradient for healthy nodes
    const healthyGradient = defs.append("radialGradient")
      .attr("id", "healthy-gradient")
      .attr("cx", "30%")
      .attr("cy", "30%")
    healthyGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10B981")
    healthyGradient.append("stop").attr("offset", "100%").attr("stop-color", "#059669")

    // Gradient for warning nodes
    const warningGradient = defs.append("radialGradient")
      .attr("id", "warning-gradient")
      .attr("cx", "30%")
      .attr("cy", "30%")
    warningGradient.append("stop").attr("offset", "0%").attr("stop-color", "#F59E0B")
    warningGradient.append("stop").attr("offset", "100%").attr("stop-color", "#D97706")

    // Gradient for critical nodes
    const criticalGradient = defs.append("radialGradient")
      .attr("id", "critical-gradient")
      .attr("cx", "30%")
      .attr("cy", "30%")
    criticalGradient.append("stop").attr("offset", "0%").attr("stop-color", "#EF4444")
    criticalGradient.append("stop").attr("offset", "100%").attr("stop-color", "#DC2626")

    // Digital twin glow effect
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur")
    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(d => {
          const link = d as Link
          switch (link.type) {
            case 'twin_sync': return 80
            case 'dependency': return 100
            case 'data_flow': return 120
            case 'network': return 150
            default: return 100
          }
        })
        .strength(d => (d as Link).strength)
      )
      .force("charge", d3.forceManyBody()
        .strength(d => {
          const node = d as Node
          switch (node.type) {
            case 'twin': return -400
            case 'compute': return -300
            case 'database': return -250
            default: return -200
          }
        })
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", d => {
        switch (d.type) {
          case 'twin_sync': return '#8B5CF6'
          case 'dependency': return '#3B82F6'
          case 'data_flow': return '#10B981'
          case 'network': return '#F59E0B'
          default: return '#6B7280'
        }
      })
      .attr("stroke-width", d => Math.sqrt(d.strength) * 3)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => d.type === 'twin_sync' ? "5,5" : "none")

    // Create link labels for bandwidth/data flow
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links.filter(d => d.bandwidth))
      .enter().append("text")
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#6B7280")
      .text(d => d.bandwidth ? `${d.bandwidth}MB/s` : '')

    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")

    // Node circles with gradients
    node.append("circle")
      .attr("r", d => {
        switch (d.type) {
          case 'twin': return 25
          case 'compute': return 20
          case 'database': return 18
          case 'storage': return 16
          case 'network': return 14
          default: return 15
        }
      })
      .attr("fill", d => {
        if (d.type === 'twin') {
          return "url(#healthy-gradient)"
        }
        switch (d.status) {
          case 'healthy': return "url(#healthy-gradient)"
          case 'warning': return "url(#warning-gradient)"
          case 'critical': return "url(#critical-gradient)"
          default: return "#6B7280"
        }
      })
      .attr("filter", d => d.type === 'twin' ? "url(#glow)" : "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // Node icons (using Unicode symbols)
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", d => d.type === 'twin' ? "14px" : "12px")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .text(d => {
        switch (d.type) {
          case 'twin': return '👁'
          case 'compute': return '🖥'
          case 'database': return '🗄'
          case 'storage': return '💾'
          case 'network': return '🌐'
          default: return '⚙'
        }
      })

    // Node labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .attr("font-weight", "500")
      .text(d => d.name)

    // Metrics display for hovered nodes
    const metricsGroup = node.append("g")
      .attr("class", "metrics")
      .style("opacity", 0)

    metricsGroup.append("rect")
      .attr("x", 30)
      .attr("y", -20)
      .attr("width", 120)
      .attr("height", 40)
      .attr("fill", "rgba(0, 0, 0, 0.8)")
      .attr("rx", 4)

    metricsGroup.append("text")
      .attr("x", 35)
      .attr("y", -5)
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .text(d => {
        if (d.metrics.cpu !== undefined) {
          return `CPU: ${d.metrics.cpu.toFixed(1)}%`
        }
        return `Utilization: ${d.metrics.utilization || 0}%`
      })

    metricsGroup.append("text")
      .attr("x", 35)
      .attr("y", 10)
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .text(d => {
        if (d.metrics.memory !== undefined) {
          return `Memory: ${d.metrics.memory.toFixed(1)}%`
        }
        return `Connections: ${d.metrics.connections || 0}`
      })

    // Prediction indicators for digital twins
    node.filter(d => d.type === 'twin' && d.predictions != null)
      .append("circle")
      .attr("r", 30)
      .attr("fill", "none")
      .attr("stroke", d => {
        const risk = d.predictions?.risk_score || 0
        if (risk > 0.7) return "#EF4444"
        if (risk > 0.4) return "#F59E0B"
        return "#10B981"
      })
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0.7)

    // Node interactions
    node
      .on("mouseover", function(event, d) {
        setHoveredNode(d)
        onNodeHover?.(d)
        
        // Highlight connected nodes
        const connectedNodes = new Set<string>()
        links.forEach(link => {
          if (typeof link.source === 'object' && link.source.id === d.id) {
            connectedNodes.add(typeof link.target === 'object' ? link.target.id : link.target)
          }
          if (typeof link.target === 'object' && link.target.id === d.id) {
            connectedNodes.add(typeof link.source === 'object' ? link.source.id : link.source)
          }
        })

        // Fade non-connected elements
        node.style("opacity", n => connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3)
        link.style("opacity", l => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source
          const targetId = typeof l.target === 'object' ? l.target.id : l.target
          return sourceId === d.id || targetId === d.id ? 1 : 0.1
        })

        // Show metrics
        d3.select(this).select(".metrics")
          .transition()
          .duration(200)
          .style("opacity", 1)
      })
      .on("mouseout", function(event, d) {
        setHoveredNode(null)
        onNodeHover?.(null)
        
        // Reset opacity
        node.style("opacity", 1)
        link.style("opacity", 0.6)

        // Hide metrics
        d3.select(this).select(".metrics")
          .transition()
          .duration(200)
          .style("opacity", 0)
      })
      .on("click", function(event, d) {
        setSelectedNode(d)
        onNodeClick?.(d)
      })

    // Drag behavior
    const drag = d3.drag<SVGGElement, Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    node.call(drag)

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Animation loop
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!)

      linkLabels
        .attr("x", d => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr("y", d => ((d.source as Node).y! + (d.target as Node).y!) / 2)

      node.attr("transform", d => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }

  }, [nodes, links, onNodeClick, onNodeHover])

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg"
      />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-purple-500 rounded"></div>
            <span>Digital Twin Sync</span>
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg min-w-[250px]"
        >
          <div className="font-semibold text-lg mb-2">{selectedNode.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Type: {selectedNode.type} • Status: {selectedNode.status}
          </div>
          
          {selectedNode.metrics && (
            <div className="mb-3">
              <div className="font-medium mb-1">Metrics</div>
              <div className="text-sm space-y-1">
                {selectedNode.metrics.cpu && (
                  <div>CPU: {selectedNode.metrics.cpu.toFixed(1)}%</div>
                )}
                {selectedNode.metrics.memory && (
                  <div>Memory: {selectedNode.metrics.memory.toFixed(1)}%</div>
                )}
                {selectedNode.metrics.utilization && (
                  <div>Utilization: {selectedNode.metrics.utilization}%</div>
                )}
              </div>
            </div>
          )}

          {selectedNode.predictions && (
            <div>
              <div className="font-medium mb-1">AI Predictions</div>
              <div className="text-sm space-y-1">
                <div>Risk Score: {(selectedNode.predictions.risk_score * 100).toFixed(1)}%</div>
                <div>Failure Probability: {(selectedNode.predictions.next_failure_probability * 100).toFixed(1)}%</div>
                <div>Cost Trend: {selectedNode.predictions.cost_trend}</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
