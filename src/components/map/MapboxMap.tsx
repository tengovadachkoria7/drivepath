"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DEFAULT_CENTER: [number, number] = [42.0015, 41.9271];
const DEFAULT_ZOOM = 13.5;

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  routeCoordinates?: [number, number][];
}

// Mapbox-ის setData-ს ოფიციალური ტიპის ავტომატური ამოღება (any-ს გარეშე)
type GeoJSONSourceData = Parameters<mapboxgl.GeoJSONSource['setData']>[0];

export default function MapboxMap({ 
  center = DEFAULT_CENTER, 
  zoom = DEFAULT_ZOOM,
  routeCoordinates 
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // 1. რუკის ინიციალიზაცია
  useEffect(() => {
    if (!token || map.current || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    try {
      const instance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: center,
        zoom: zoom,
        pitch: 45,
      });

      map.current = instance;

      instance.on('load', () => {
        setMapLoaded(true);
        instance.resize();
      });

      instance.on('error', (e) => {
        console.error("Mapbox შეCentral error:", e);
      });

    } catch (err) {
      console.error("Mapbox ინიციალიზაციის შეცდომა:", err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, center, zoom]);

  // 2. მარშრუტის დახატვა
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const mapInstance = map.current;

    const drawRoute = () => {
      if (!mapInstance.isStyleLoaded()) return;

      const sourceId = 'route-source';
      const layerId = 'route-layer';

      if (!routeCoordinates || routeCoordinates.length === 0) {
        if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
        if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
        return;
      }

      const geojsonData: GeoJSONSourceData = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      };

      const existingSource = mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;

      if (existingSource) {
        existingSource.setData(geojsonData);
      } else {
        mapInstance.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData
        });

        mapInstance.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });
      }

      if (routeCoordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds(
          routeCoordinates[0],
          routeCoordinates[0]
        );
        for (const coord of routeCoordinates) {
          bounds.extend(coord);
        }
        
        mapInstance.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000
        });
      }
    };

    if (mapInstance.isStyleLoaded()) {
      drawRoute();
    } else {
      mapInstance.once('style.load', drawRoute);
    }

  }, [mapLoaded, routeCoordinates]);

  if (!token) {
    return (
      <div className="relative w-full h-full min-h-[400px] rounded-2xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-red-400 p-4 text-center font-medium">
        Mapbox ტოკენი ვერ მოიძებნა .env.local ფაილში
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-400 font-medium">იტვირთება რუკა...</p>
        </div>
      )}

      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}