// Advanced D3.js Time Series Visualization
'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface TimeSeriesData {
  timestamp: Date
  value: number
  metric: string
  prediction?: number
  anomaly?: boolean
  confidence?: number
}

interface D3TimeSeriesChartProps {
  data: TimeSeriesData[]
  width?: number
  height?: number
  showPredictions?: boolean
  showAnomalies?: boolean
  interactive?: boolean
  onBrush?: (selection: [Date, Date] | null) => void
}

export function D3TimeSeriesChart({
  data,
  width = 800,
  height = 400,
  showPredictions = true,
  showAnomalies = true,
  interactive = true,
  onBrush
}: D3TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
  }>({ visible: false, x: 0, y: 0, content: '' })

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.selectAll("*").remove()

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Math.max(d.value, d.prediction || 0)) as [number, number])
      .nice()
      .range([innerHeight, 0])

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Define gradients
    const defs = svg.append("defs")
    
    const gradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", innerHeight)
      .attr("x2", 0).attr("y2", 0)
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.1)
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.3)

    // Create area generator
    const area = d3.area<TimeSeriesData>()
      .x(d => xScale(d.timestamp))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveCardinal)

    // Create line generator
    const line = d3.line<TimeSeriesData>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveCardinal)

    // Create prediction line generator
    const predictionLine = d3.line<TimeSeriesData>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.prediction || d.value))
      .curve(d3.curveCardinal)
      .defined(d => d.prediction !== undefined)

    // Add grid lines
    const xGrid = g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    const yGrid = g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    // Add area
    g.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)

    // Add main line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add prediction line
    if (showPredictions) {
      const predictionData = data.filter(d => d.prediction !== undefined)
      if (predictionData.length > 0) {
        g.append("path")
          .datum(predictionData)
          .attr("fill", "none")
          .attr("stroke", "#8B5CF6")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("d", predictionLine)
          .style("opacity", 0.8)

        // Add confidence bands
        const confidenceArea = d3.area<TimeSeriesData>()
          .x(d => xScale(d.timestamp))
          .y0(d => yScale((d.prediction || 0) - (d.confidence || 0) * 10))
          .y1(d => yScale((d.prediction || 0) + (d.confidence || 0) * 10))
          .curve(d3.curveCardinal)
          .defined(d => d.prediction !== undefined && d.confidence !== undefined)

        g.append("path")
          .datum(predictionData)
          .attr("fill", "#8B5CF6")
          .attr("fill-opacity", 0.1)
          .attr("d", confidenceArea)
      }
    }

    // Add anomaly markers
    if (showAnomalies) {
      const anomalies = data.filter(d => d.anomaly)
      
      g.selectAll(".anomaly")
        .data(anomalies)
        .enter()
        .append("circle")
        .attr("class", "anomaly")
        .attr("cx", d => xScale(d.timestamp))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", "#EF4444")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("opacity", 0.8)

      // Add anomaly labels
      g.selectAll(".anomaly-label")
        .data(anomalies)
        .enter()
        .append("text")
        .attr("class", "anomaly-label")
        .attr("x", d => xScale(d.timestamp))
        .attr("y", d => yScale(d.value) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#EF4444")
        .attr("font-weight", "bold")
        .text("⚠")
    }

    // Add data points
    const dots = g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.timestamp))
      .attr("cy", d => yScale(d.value))
      .attr("r", 3)
      .attr("fill", "#3B82F6")
      .style("opacity", 0)

    // Add axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%H:%M"))
      )

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale))

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Value")

    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Time")

    // Interactive features
    if (interactive) {
      // Add brush for zooming
      const brush = d3.brushX()
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on("end", (event) => {
          if (!event.selection) {
            onBrush?.(null)
            return
          }
          
          const [x0, x1] = event.selection
          const dateRange: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)]
          onBrush?.(dateRange)
        })

      g.append("g")
        .attr("class", "brush")
        .call(brush)

      // Add hover interactions
      const overlay = g.append("rect")
        .attr("class", "overlay")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .style("fill", "none")
        .style("pointer-events", "all")

      const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none")

      focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .style("stroke", "#666")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3")

      focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .style("stroke", "#666")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3")

      focus.append("circle")
        .attr("r", 4)
        .style("fill", "#3B82F6")
        .style("stroke", "#fff")
        .style("stroke-width", "2px")

      overlay
        .on("mouseover", () => {
          focus.style("display", null)
          dots.style("opacity", 1)
        })
        .on("mouseout", () => {
          focus.style("display", "none")
          dots.style("opacity", 0)
          setTooltip(prev => ({ ...prev, visible: false }))
        })
        .on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event, this)
          const x0 = xScale.invert(mouseX)
          
          // Find closest data point
          const bisectDate = d3.bisector<TimeSeriesData, Date>(d => d.timestamp).left
          const i = bisectDate(data, x0, 1)
          const d0 = data[i - 1]
          const d1 = data[i]
          const d = d1 && (x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime()) ? d1 : d0
          
          if (d) {
            const x = xScale(d.timestamp)
            const y = yScale(d.value)
            
            focus.attr("transform", `translate(${x},${y})`)
            focus.select(".x-hover-line").attr("transform", `translate(${-x},0)`)
            focus.select(".y-hover-line").attr("transform", `translate(0,${-y})`)
            
            // Show tooltip
            const [mousePageX, mousePageY] = d3.pointer(event, document.body)
            setTooltip({
              visible: true,
              x: mousePageX + 10,
              y: mousePageY - 10,
              content: `
                Time: ${d3.timeFormat("%H:%M:%S")(d.timestamp)}
                Value: ${d.value.toFixed(2)}
                ${d.prediction ? `Prediction: ${d.prediction.toFixed(2)}` : ''}
                ${d.anomaly ? 'Anomaly Detected!' : ''}
              `
            })
          }
        })
    }

    // Add legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth - 150}, 20)`)

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .style("stroke", "#3B82F6")
      .style("stroke-width", 2)

    legend.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text("Actual")

    if (showPredictions) {
      legend.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 15)
        .attr("y2", 15)
        .style("stroke", "#8B5CF6")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5")

      legend.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text("Prediction")
    }

    if (showAnomalies) {
      legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 30)
        .attr("r", 4)
        .style("fill", "#EF4444")

      legend.append("text")
        .attr("x", 25)
        .attr("y", 30)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text("Anomaly")
    }

  }, [data, width, height, showPredictions, showAnomalies, interactive, onBrush])

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-white dark:bg-slate-800 rounded-lg"
      />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute bg-black text-white p-2 rounded text-xs whitespace-pre-line pointer-events-none z-10"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
