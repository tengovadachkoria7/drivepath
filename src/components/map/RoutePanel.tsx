"use client";

import type { DrivingRoute } from '@/data/routes';

interface RoutePanelProps {
  routes: DrivingRoute[];
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
}

export default function RoutePanel({ routes, activeRouteId, onSelectRoute }: RoutePanelProps) {
  const activeRoute = routes.find((route) => route.id === activeRouteId) || routes[0];

  if (!activeRoute) return null;

  return (
    <div className="w-full md:w-96 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 text-white shadow-xl">
      <div>
        <h2 className="text-lg font-bold text-blue-400">ოზურგეთის მარშრუტები</h2>
        <p className="text-xs text-neutral-400">აირჩიეთ საგამოცდო მარშრუტი დეტალების სანახავად</p>
      </div>

      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          const isActive = route.id === activeRouteId;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-neutral-800/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{route.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  route.difficulty === 'ადვილი' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  route.difficulty === 'საშუალო' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {route.difficulty}
                </span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">{route.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
        <div className="bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-[10px] text-neutral-400 block">მანძილი</span>
          <span className="text-sm font-bold text-neutral-200">{activeRoute.distance}</span>
        </div>
        <div className="bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-800/80">
          <span className="text-[10px] text-neutral-400 block">სავარაუდო დრო</span>
          <span className="text-sm font-bold text-neutral-200">{activeRoute.duration}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800 max-h-48 overflow-y-auto">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">საგზაო მითითებები</h3>
        {activeRoute.tips.map((tip) => (
          <div key={tip.id} className="p-2.5 rounded-xl bg-neutral-800/30 border border-neutral-800 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                tip.type === 'stop' ? 'bg-red-500' :
                tip.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <span className="text-xs font-medium text-neutral-200">{tip.title}</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed pl-4">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}