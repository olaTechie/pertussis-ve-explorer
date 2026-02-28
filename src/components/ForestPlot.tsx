import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { VEEstimate } from '../types';
import { STUDIES } from '../data/studies';

const COLORS: Record<string, string> = {
  Ward2005: '#1F4E79',
  Baxter2013: '#2E75B6',
  Bell2019: '#4A90D9',
  Liu2020: '#7FB3E0',
  Witt2013: '#A0C4E8',
  Crowcroft2021: '#3B7DD8',
};

interface ForestPlotProps {
  estimates: VEEstimate[];
  onRowClick?: (studyId: string) => void;
}

export default function ForestPlot({ estimates, onRowClick }: ForestPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const sorted = useMemo(() => {
    const studyOrder = STUDIES.map(s => s.id);
    return [...estimates].sort((a, b) => {
      const ai = studyOrder.indexOf(a.studyId);
      const bi = studyOrder.indexOf(b.studyId);
      if (ai !== bi) return ai - bi;
      return (a.ve ?? 0) - (b.ve ?? 0);
    });
  }, [estimates]);

  useEffect(() => {
    if (!svgRef.current || sorted.length === 0) return;

    const margin = { top: 30, right: 40, bottom: 30, left: 220 };
    const rowHeight = 28;
    const width = 750;
    const height = margin.top + sorted.length * rowHeight + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleLinear().domain([-60, 100]).range([margin.left, width - margin.right]);
    const y = (i: number) => margin.top + i * rowHeight + rowHeight / 2;

    // Background
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'white');

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${margin.top - 5})`)
      .call(d3.axisTop(x).ticks(8).tickFormat(d => `${d}%`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748B').attr('font-size', '10px'));

    // Grid lines
    svg.append('g')
      .selectAll('line')
      .data(x.ticks(8))
      .join('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', margin.top).attr('y2', height - margin.bottom)
      .attr('stroke', '#f0f0f0');

    // Null effect line at 0%
    svg.append('line')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', margin.top).attr('y2', height - margin.bottom)
      .attr('stroke', '#94a3b8').attr('stroke-dasharray', '4,3');

    // Rows
    const studyLookup = Object.fromEntries(STUDIES.map(s => [s.id, s]));

    sorted.forEach((est, i) => {
      const cy = y(i);
      const color = COLORS[est.studyId] ?? '#666';
      const study = studyLookup[est.studyId];
      const label = `${study?.author ?? est.studyId} ${study?.year ?? ''}: ${est.label}`;
      const isSubgroup = est.estimateType !== 'primary' && est.subgroupType !== 'overall';

      // Row background on hover
      const rowGroup = svg.append('g')
        .style('cursor', 'pointer')
        .on('click', () => onRowClick?.(est.studyId));

      rowGroup.append('rect')
        .attr('x', 0).attr('y', cy - rowHeight / 2)
        .attr('width', width).attr('height', rowHeight)
        .attr('fill', 'transparent')
        .on('mouseover', function () { d3.select(this).attr('fill', '#f8fafc'); })
        .on('mouseout', function () { d3.select(this).attr('fill', 'transparent'); });

      // Label
      rowGroup.append('text')
        .attr('x', isSubgroup ? margin.left - 10 : margin.left - 16)
        .attr('y', cy)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#1E293B')
        .attr('font-size', isSubgroup ? '11px' : '12px')
        .attr('font-weight', isSubgroup ? 'normal' : '500')
        .text(label.length > 35 ? label.slice(0, 35) + '\u2026' : label);

      // CI line
      if (est.ci_lower !== null && est.ci_upper !== null) {
        const xLow = Math.max(x.domain()[0], est.ci_lower);
        const xHigh = Math.min(x.domain()[1], est.ci_upper);
        const significant = est.ci_lower > 0 || est.ci_upper < 0;

        rowGroup.append('line')
          .attr('x1', x(xLow)).attr('x2', x(xHigh))
          .attr('y1', cy).attr('y2', cy)
          .attr('stroke', significant ? color : '#94a3b8')
          .attr('stroke-width', 1.5);

        // Arrow if clipped
        if (est.ci_lower < x.domain()[0]) {
          rowGroup.append('text').attr('x', x(x.domain()[0]) - 2).attr('y', cy)
            .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
            .attr('fill', '#94a3b8').attr('font-size', '10px').text('\u25C0');
        }
        if (est.ci_upper > x.domain()[1]) {
          rowGroup.append('text').attr('x', x(x.domain()[1]) + 2).attr('y', cy)
            .attr('text-anchor', 'start').attr('dominant-baseline', 'middle')
            .attr('fill', '#94a3b8').attr('font-size', '10px').text('\u25B6');
        }
      }

      // Point estimate
      if (est.ve !== null) {
        const veX = x(Math.max(x.domain()[0], Math.min(x.domain()[1], est.ve)));
        const ciWidth = (est.ci_upper ?? 50) - (est.ci_lower ?? -50);
        const size = Math.max(4, Math.min(10, 200 / (ciWidth + 1)));

        rowGroup.append('rect')
          .attr('x', veX - size / 2).attr('y', cy - size / 2)
          .attr('width', size).attr('height', size)
          .attr('fill', color);

        // Value label
        rowGroup.append('text')
          .attr('x', width - margin.right + 5).attr('y', cy)
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#1E293B').attr('font-size', '10px').attr('font-family', 'monospace')
          .text(`${est.ve}%`);
      }

      // Tooltip
      rowGroup.append('title').text(
        `${study?.author} ${study?.year}: ${est.label}\nVE: ${est.ve !== null ? est.ve + '%' : 'N/A'}` +
        (est.ci_lower !== null ? ` (${est.ci_lower}, ${est.ci_upper})` : '') +
        (est.timeSinceVaccLabel ? `\nTime: ${est.timeSinceVaccLabel}` : '') +
        (est.ageGroup ? `\nAge: ${est.ageGroup}` : '')
      );
    });

    // Bottom axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d => `${d}%`))
      .call(g => g.select('.domain').attr('stroke', '#ccc'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748B').attr('font-size', '10px'));

    // X-axis label
    svg.append('text')
      .attr('x', (margin.left + width - margin.right) / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B').attr('font-size', '11px')
      .text('Vaccine Effectiveness (%)');

  }, [sorted, onRowClick]);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-[#64748B]">
        No estimates match the current filters.
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full" style={{ minWidth: 750 }} />;
}
