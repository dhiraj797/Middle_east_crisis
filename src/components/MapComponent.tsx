'use client';

import { useEffect, useState } from 'react';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  type: 'conflict' | 'bosch' | 'shipping' | 'oil';
  description: string;
}

const CONFLICT_ZONES: MapPoint[] = [
  { lat: 31.5, lng: 34.75, label: 'Gaza', type: 'conflict', description: 'Active conflict zone' },
  { lat: 33.85, lng: 35.86, label: 'Lebanon', type: 'conflict', description: 'Hezbollah tensions' },
  { lat: 32.0, lng: 53.0, label: 'Iran', type: 'conflict', description: 'Nuclear tensions / Regional power' },
  { lat: 15.5, lng: 44.2, label: 'Yemen (Houthis)', type: 'conflict', description: 'Red Sea attacks' },
  { lat: 34.8, lng: 38.9, label: 'Syria', type: 'conflict', description: 'Ongoing instability' },
  { lat: 33.3, lng: 44.4, label: 'Iraq', type: 'conflict', description: 'Iran-backed militia activity' },
];

const BOSCH_PLANTS: MapPoint[] = [
  { lat: 12.97, lng: 77.59, label: 'Bangalore', type: 'bosch', description: 'Bosch India HQ & Manufacturing' },
  { lat: 26.91, lng: 75.78, label: 'Jaipur', type: 'bosch', description: 'Bosch Manufacturing Plant' },
  { lat: 20.0, lng: 73.78, label: 'Nashik', type: 'bosch', description: 'Bosch Manufacturing Plant' },
  { lat: 9.23, lng: 77.43, label: 'Gangaikondan', type: 'bosch', description: 'Bosch Manufacturing Plant' },
];

const SHIPPING_ROUTES: MapPoint[] = [
  { lat: 30.0, lng: 32.5, label: 'Suez Canal', type: 'shipping', description: 'Critical trade route - Disrupted' },
  { lat: 12.8, lng: 43.3, label: 'Bab el-Mandeb', type: 'shipping', description: 'Red Sea chokepoint - Under threat' },
  { lat: 26.0, lng: 56.3, label: 'Strait of Hormuz', type: 'shipping', description: '20% of global oil transit' },
];

const OIL_ROUTES: MapPoint[] = [
  { lat: 25.3, lng: 51.5, label: 'Qatar', type: 'oil', description: 'Major LNG supplier to India' },
  { lat: 24.5, lng: 54.6, label: 'UAE', type: 'oil', description: 'Key oil supplier to India' },
  { lat: 23.6, lng: 45.0, label: 'Saudi Arabia', type: 'oil', description: 'Largest oil supplier to India' },
];

export default function MapComponent() {
  const [activeLayer, setActiveLayer] = useState<'all' | 'conflict' | 'bosch' | 'shipping' | 'oil'>('all');
  const [MapReady, setMapReady] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!MapReady || !L) return;

    const container = document.getElementById('crisis-map');
    if (!container) return;

    // Clean up previous map instance
    const existingMap = (container as HTMLElement & { _leaflet_id?: number })._leaflet_id;
    if (existingMap) {
      container.innerHTML = '';
      delete (container as HTMLElement & { _leaflet_id?: number })._leaflet_id;
    }

    const map = L.map('crisis-map', {
      center: [22, 55],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const allPoints = [
      ...(activeLayer === 'all' || activeLayer === 'conflict' ? CONFLICT_ZONES : []),
      ...(activeLayer === 'all' || activeLayer === 'bosch' ? BOSCH_PLANTS : []),
      ...(activeLayer === 'all' || activeLayer === 'shipping' ? SHIPPING_ROUTES : []),
      ...(activeLayer === 'all' || activeLayer === 'oil' ? OIL_ROUTES : []),
    ];

    allPoints.forEach((point) => {
      const colors: Record<string, string> = {
        conflict: '#ef4444',
        bosch: '#3b82f6',
        shipping: '#f59e0b',
        oil: '#22c55e',
      };
      const color = colors[point.type];
      const size = point.type === 'conflict' ? 12 : 10;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}40;
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      L.marker([point.lat, point.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="color: #1e293b; font-family: system-ui;">
            <strong style="color: ${color};">${point.label}</strong>
            <br/><span style="font-size: 12px;">${point.description}</span>
          </div>`
        );
    });

    // Draw shipping route lines
    if (activeLayer === 'all' || activeLayer === 'shipping') {
      // Suez route
      const suezRoute: [number, number][] = [
        [12.97, 77.59], [12.8, 43.3], [30.0, 32.5], [35.0, 25.0], [43.0, 10.0],
      ];
      L.polyline(suezRoute, { color: '#f59e0b', weight: 2, opacity: 0.6, dashArray: '10, 5' }).addTo(map);

      // Cape route (alternative)
      const capeRoute: [number, number][] = [
        [12.97, 77.59], [0, 50], [-10, 40], [-34.5, 18.5], [-20, 10], [0, 0], [35, -5], [43.0, 10.0],
      ];
      L.polyline(capeRoute, { color: '#ef4444', weight: 2, opacity: 0.4, dashArray: '5, 10' }).addTo(map);
    }

    return () => {
      map.remove();
    };
  }, [MapReady, L, activeLayer]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            Strategic Map
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', color: 'slate' },
              { key: 'conflict', label: 'Conflicts', color: 'red' },
              { key: 'bosch', label: 'Bosch Plants', color: 'blue' },
              { key: 'shipping', label: 'Shipping', color: 'amber' },
              { key: 'oil', label: 'Oil Routes', color: 'green' },
            ].map((layer) => (
              <button
                key={layer.key}
                onClick={() => setActiveLayer(layer.key as typeof activeLayer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLayer === layer.key
                    ? `bg-${layer.color}-500/20 text-${layer.color}-400 border border-${layer.color}-500/30`
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
                style={
                  activeLayer === layer.key
                    ? {
                        backgroundColor: layer.color === 'red' ? 'rgba(239,68,68,0.2)' :
                          layer.color === 'blue' ? 'rgba(59,130,246,0.2)' :
                          layer.color === 'amber' ? 'rgba(245,158,11,0.2)' :
                          layer.color === 'green' ? 'rgba(34,197,94,0.2)' :
                          'rgba(100,116,139,0.2)',
                        color: layer.color === 'red' ? '#f87171' :
                          layer.color === 'blue' ? '#60a5fa' :
                          layer.color === 'amber' ? '#fbbf24' :
                          layer.color === 'green' ? '#4ade80' :
                          '#94a3b8',
                        borderColor: layer.color === 'red' ? 'rgba(239,68,68,0.3)' :
                          layer.color === 'blue' ? 'rgba(59,130,246,0.3)' :
                          layer.color === 'amber' ? 'rgba(245,158,11,0.3)' :
                          layer.color === 'green' ? 'rgba(34,197,94,0.3)' :
                          'rgba(100,116,139,0.3)',
                      }
                    : {}
                }
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Conflict Zones</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Bosch India</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Shipping</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Oil Routes</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-0 border-t-2 border-dashed border-amber-500 inline-block" style={{ width: '12px' }} /> Suez Route</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-0 border-t-2 border-dashed border-red-500 inline-block" style={{ width: '12px' }} /> Cape Route</span>
        </div>
      </div>
      <div id="crisis-map" className="w-full h-[450px]" />
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        .leaflet-container { background: #0f172a; }
      `}</style>
    </div>
  );
}
