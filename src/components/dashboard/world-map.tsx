
"use client";

import React, { useMemo } from 'react';
import type { Shipment } from '@/services/logistics-api';

type CityCoordinates = {
  [key: string]: { x: number; y: number };
};

const cityCoordinates: CityCoordinates = {
  "New York": { x: 235, y: 155 },
  "Santa Elena": { x: 190, y: 240 },
  "Stockholm": { x: 490, y: 115 },
  "Singapore": { x: 695, y: 245 },
  "Gothenburg": { x: 480, y: 125 },
};

type WorldMapProps = {
  data: Shipment[];
};

export const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
  const destinationData = useMemo(() => {
    const destinationCounts = data.reduce((acc, shipment) => {
      const dest = shipment.destination;
      if (cityCoordinates[dest]) {
        acc[dest] = (acc[dest] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(destinationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/20">
      <svg viewBox="0 0 1009 665" className="max-w-full max-h-full">
        {/* SVG Path for the world map */}
        <path
          d="M1009 332.5H994V317.5H979V302.5H964V287.5H949V272.5H934V257.5H919V242.5H904V227.5H889V212.5H874V197.5H859V182.5H844V167.5H829V152.5H814V137.5H799V122.5H784V107.5H769V92.5H754V77.5H739V62.5H724V47.5H709V32.5H694V17.5H679V2.5H664V17.5H649V32.5H634V47.5H619V62.5H604V77.5H589V92.5H574V107.5H559V122.5H544V137.5H529V152.5H514V167.5H499V182.5H484V197.5H469V212.5H454V227.5H439V242.5H424V257.5H409V272.5H394V287.5H379V302.5H364V317.5H349V332.5H334V347.5H319V362.5H304V377.5H289V392.5H274V407.5H259V422.5H244V437.5H229V452.5H214V467.5H199V482.5H184V497.5H169V512.5H154V527.5H139V542.5H124V557.5H109V572.5H94V587.5H79V602.5H64V617.5H49V632.5H34V647.5H19V662.5H4V647.5H19V632.5H34V617.5H49V602.5H64V587.5H79V572.5H94V557.5H109V542.5H124V527.5H139V512.5H154V497.5H169V482.5H184V467.5H199V452.5H214V437.5H229V422.5H244V407.5H259V392.5H274V377.5H289V362.5H304V347.5H319V332.5H334V317.5H349V302.5H364V287.5H379V272.5H394V257.5H409V242.5H424V227.5H439V212.5H454V197.5H469V182.5H484V167.5H499V152.5H514V137.5H529V122.5H544V107.5H559V92.5H574V77.5H589V62.5H604V47.5H619V32.5H634V17.5H649V2.5H664V17.5H679V32.5H694V47.5H709V62.5H724V77.5H739V92.5H754V107.5H769V122.5H784V137.5H799V152.5H814V167.5H829V182.5H844V197.5H859V212.5H874V227.5H889V242.5H904V257.5H919V272.5H934V287.5H949V302.5H964V317.5H979V332.5H994V347.5H1009V332.5Z"
          fill="#D6D6D6"
        />
        {/* Render pins for each city in the data */}
        {destinationData.map(({ name, count }) => {
          const coords = cityCoordinates[name];
          if (!coords) return null;

          return (
            <g key={name} transform={`translate(${coords.x}, ${coords.y})`}>
              <circle r="8" fill="hsl(var(--primary))" className="opacity-75 animate-pulse" />
              <circle r="4" fill="hsl(var(--primary))" />
              <text
                y="-15"
                textAnchor="middle"
                className="text-xs font-semibold fill-foreground"
                style={{ pointerEvents: 'none' }}
              >
                {name} ({count})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
