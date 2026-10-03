"use client";

import { useState } from 'react';
import MapboxMap from '@/components/map/MapboxMap';
import { Navigation, Route, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const routesData = [
  {
    id: 'route-1',
    title: 'მარშრუტი 1',
    status: 'ხელმისაწვდომია',
    coordinates: [
      [42.0015, 41.9271],
      [42.0030, 41.9250],
      [42.0080, 41.9210],
      [42.0120, 41.9180],
      [42.0100, 41.9150]
    ] as [number, number][]
  },
  {
    id: 'route-2',
    title: 'მარშრუტი 2',
    status: 'ხელმისაწვდომია',
    coordinates: [
      [42.0015, 41.9271],
      [41.9980, 41.9290],
      [41.9920, 41.9320],
      [41.9880, 41.9350]
    ] as [number, number][]
  },
  {
    id: 'route-3',
    title: 'მარშრუტი 3',
    status: 'ხელმისაწვდომია',
    coordinates: [
      [42.0015, 41.9271],
      [42.0050, 41.9300],
      [42.0100, 41.9320],
      [42.0150, 41.9280]
    ] as [number, number][]
  }
];

export default function OzurgetiPracticePage() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routesData[0].id);

  const activeRoute = routesData.find(r => r.id === selectedRouteId) || routesData[0];

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-950 text-neutral-50 overflow-hidden">
      
      {/* ზედა ნავიგაცია */}
      <header className="h-16 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md flex items-center px-4 shrink-0 z-10">
        <Link href="/" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors mr-4">
          <ArrowLeft className="w-5 h-5 text-neutral-400" />
        </Link>
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-bold">ოზურგეთი - პრაქტიკა</h1>
        </div>
      </header>

      {/* მთავარი კონტენტი */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* მარცხენა პანელი მარშრუტების ასარჩევად */}
        <aside className="w-full lg:w-96 bg-neutral-900/50 border-r border-neutral-800 flex flex-col shrink-0 z-10">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="font-semibold text-neutral-200 flex items-center gap-2">
              <Route className="w-4 h-4" />
              აირჩიე მარშრუტი
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-3 overflow-y-auto">
            {routesData.map((route) => {
              const isSelected = route.id === selectedRouteId;
              
              return (
                <button 
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    isSelected 
                      ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20' 
                      : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isSelected ? 'text-blue-400' : 'text-neutral-300'}`}>
                    {route.title}
                  </div>
                  <div className={`text-sm ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    სტატუსი: {route.status}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* რუკის არეალი */}
        <section className="flex-1 p-2 lg:p-4 h-[60vh] lg:h-full">
          <MapboxMap 
            center={activeRoute.coordinates[0]} 
            routeCoordinates={activeRoute.coordinates} 
          />
        </section>

      </main>
    </div>
  );
}