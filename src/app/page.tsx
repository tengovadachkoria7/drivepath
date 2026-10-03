'use client';

import { useState } from 'react';
import MapboxMap from '@/components/map/MapboxMap';
import RoutePanel from '@/components/map/RoutePanel';
import { OZURGETI_ROUTES } from '@/data/routes';

export default function Home() {
  const [activeRouteId, setActiveRouteId] = useState<string>(OZURGETI_ROUTES[0].id);
  const activeRoute = OZURGETI_ROUTES.find((route) => route.id === activeRouteId) || OZURGETI_ROUTES[0];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex flex-col md:flex-row">
      <div className="relative w-full h-full">
        <MapboxMap
          center={activeRoute.coordinates[0]}
          routeCoordinates={activeRoute.coordinates}
        />

        <div className="absolute top-4 left-4 right-4 md:right-auto z-20 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <RoutePanel
            routes={OZURGETI_ROUTES}
            activeRouteId={activeRouteId}
            onSelectRoute={setActiveRouteId}
          />
        </div>
      </div>
    </main>
  );
}