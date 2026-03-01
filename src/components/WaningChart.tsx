import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { WaningPoint } from '../types';

const SERIES_COLORS: Record<string, string> = {
  'Bell2019-Full cohort': '#2E75B6',
  'Bell2019-Adult >21yr': '#7FB3E0',
  'Liu2020-PCR main': '#1F4E79',
  'Liu2020-PCR rematched': '#94a3b8',
  'Crowcroft2021-FMD': '#3B7DD8',
  'Crowcroft2021-TND': '#A0AEC0',
};

interface WaningChartProps {
  data: WaningPoint[];
  height?: number;
}

export default function WaningChart({ data, height = 300 }: WaningChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 20, right: 160, bottom: 40, left: 50 };
    const width = 700;
    const h = height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', h).attr('viewBox', `0 0 ${width} ${h}`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.timeMidpoint_years) ?? 12])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([-30, 100])
      .range([h - margin.bottom, margin.top]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${h - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d} yr`))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748B').attr('font-size', '10px'))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}%`))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748B').attr('font-size', '10px'))
      .call(g => g.select('.domain').attr('stroke', '#ccc'));

    // Grid
    svg.append('g')
      .selectAll('line')
      .data(y.ticks(6))
      .join('line')
      .attr('x1', margin.left).attr('x2', width - margin.right)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#f0f0f0');

    // 0% reference
    svg.append('line')
      .attr('x1', margin.left).attr('x2', width - margin.right)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#94a3b8').attr('stroke-dasharray', '4,3');

    // Group by series
    const grouped = d3.group(data, d => `${d.studyId}-${d.series}`);

    const line = d3.line<WaningPoint>()
      .x(d => x(d.timeMidpoint_years))
      .y(d => y(d.ve ?? 0));

    grouped.forEach((points, key) => {
      const color = SERIES_COLORS[key] ?? '#666';
      const sorted = [...points].sort((a, b) => a.timeMidpoint_years - b.timeMidpoint_years);

      // CI area
      svg.append('path')
        .datum(sorted)
        .attr('fill', color)
        .attr('fill-opacity', 0.08)
        .attr('d', d3.area<WaningPoint>()
          .x(d => x(d.timeMidpoint_years))
          .y0(d => y(d.ci_lower ?? 0))
          .y1(d => y(d.ci_upper ?? 0))
        );

      // Line
      svg.append('path')
        .datum(sorted)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Points
      svg.selectAll(null)
        .data(sorted)
        .join('circle')
        .attr('cx', d => x(d.timeMidpoint_years))
        .attr('cy', d => y(d.ve ?? 0))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5);

      // Legend entry
      const lastPt = sorted[sorted.length - 1];
      const [studyId, series] = key.split('-');
      const study = { Bell2019: 'Bell', Liu2020: 'Liu', Crowcroft2021: 'Crowcroft' }[studyId] ?? studyId;

      svg.append('text')
        .attr('x', width - margin.right + 8)
        .attr('y', y(lastPt.ve ?? 0))
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(`${study} (${series})`);
    });

    // Labels
    svg.append('text')
      .attr('x', (margin.left + width - margin.right) / 2)
      .attr('y', h - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B').attr('font-size', '11px')
      .text('Time since vaccination (years)');

    svg.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -(margin.top + h - margin.bottom) / 2)
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B').attr('font-size', '11px')
      .text('VE (%)');

  }, [data, height]);

  if (data.length === 0) {
    return <div className="text-center py-8 text-[#64748B] text-sm">No waning data available.</div>;
  }

  return <svg ref={svgRef} className="w-full" style={{ minWidth: 700 }} />;
}
