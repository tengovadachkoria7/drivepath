'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Clock3,
  Compass,
  MapPin,
  Navigation,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type Coordinate = [number, number];
type RouteInfo = {
  id: string;
  name: string;
  title: string;
  duration: string;
  distance: string;
  description: string;
  coordinates: Coordinate[];
  directions: string[];
};

const cities = [
  'რუსთავი', 'ბათუმი', 'ქუთაისი', 'ფოთი', 'გორი',
  'თელავი', 'ახალციხე', 'ოზურგეთი', 'ზუგდიდი', 'საჩხერე',
];

const routes: RouteInfo[] = [
  {
    id: 'central', name: 'მარშრუტი 1', title: 'ცენტრალური წრე', duration: '18 წთ', distance: '4.8 კმ',
    description: 'ქალაქის ცენტრალური ქუჩები, მოსახვევები და მოძრაობის ძირითადი მონაკვეთები.',
    coordinates: [[42.0036, 41.9248], [42.0062, 41.9257], [42.0101, 41.9251], [42.0121, 41.9223], [42.0104, 41.9194], [42.0063, 41.9188], [42.0028, 41.9212], [42.0036, 41.9248]],
    directions: ['მოძრაობა დაიწყე პირდაპირ და დაიცავი უსაფრთხო დისტანცია.', 'მოემზადე მარჯვნივ მოხვევისთვის.', 'გააგრძელე მოძრაობა მთავარ გზაზე.', 'შემდეგ გზაჯვარედინზე შეუხვიე მარცხნივ.', 'შეინარჩუნე სიჩქარე და მიჰყევი მარშრუტს.', 'მარშრუტი სრულდება. გააჩერე ავტომობილი უსაფრთხო ადგილას.'],
  },
  {
    id: 'railway', name: 'მარშრუტი 2', title: 'სარკინიგზო გზა', duration: '22 წთ', distance: '5.6 კმ',
    description: 'სარკინიგზო სადგურის მიმართულება და შერეული საგზაო პირობები ქალაქის ქუჩებში.',
    coordinates: [[42.0036, 41.9248], [42.0004, 41.9272], [41.9978, 41.9308], [41.9941, 41.9321], [41.9914, 41.9296], [41.9948, 41.9264], [41.9996, 41.9235], [42.0036, 41.9248]],
    directions: ['დაიწყე მოძრაობა და მიჰყევი მთავარ ქუჩას.', 'წინ არის გზაჯვარედინი. შეანელე და შეამოწმე მოძრაობა.', 'გააგრძელე სვლა სარკინიგზო სადგურის მიმართულებით.', 'მოემზადე მარცხნივ მოსახვევად.', 'გზაჯვარედინზე დაიცავი პრიორიტეტი.', 'მარშრუტი სრულდება. გააჩერე ავტომობილი უსაფრთხო ადგილას.'],
  },
  {
    id: 'hospital', name: 'მარშრუტი 3', title: 'საავადმყოფოს ზონა', duration: '20 წთ', distance: '5.1 კმ',
    description: 'საავადმყოფოს მიმდებარე ქუჩები, მშვიდი ზონები და ყურადღებით გასავლელი მონაკვეთები.',
    coordinates: [[42.0036, 41.9248], [42.0069, 41.9285], [42.0107, 41.9312], [42.0146, 41.9301], [42.0158, 41.9264], [42.0128, 41.9233], [42.0088, 41.9214], [42.0036, 41.9248]],
    directions: ['დაიწყე მოძრაობა პირდაპირ.', 'წინ არის ქვეითთა გადასასვლელი. შეანელე.', 'გააგრძელე მოძრაობა საავადმყოფოს ზონისკენ.', 'მოემზადე მარჯვნივ მოსახვევად.', 'ყურადღება მიაქციე ნიშნებს და ქვეითებს.', 'მარშრუტი სრულდება. გააჩერე ავტომობილი უსაფრთხო ადგილას.'],
  },
];

type Screen = 'home' | 'cities' | 'routes' | 'map';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRouteId, setActiveRouteId] = useState(routes[0].id);
  const [toast, setToast] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const activeRoute = routes.find((route) => route.id === activeRouteId) ?? routes[0];
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const speakInstruction = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setToast('ამ ბრაუზერში ხმოვანი მითითებები მიუწვდომელია.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ka-GE';
    utterance.rate = 0.92;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (screen !== 'map' || !mapContainer.current || !token) return;
    let disposed = false;
    let map: mapboxgl.Map | null = null;

    void import('mapbox-gl').then(({ default: mapbox }) => {
      if (disposed || !mapContainer.current) return;
      mapbox.accessToken = token;
      map = new mapbox.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: activeRoute.coordinates[0],
        zoom: 14.2,
        pitch: 35,
        attributionControl: true,
      });
      mapRef.current = map;
      map.addControl(new mapbox.NavigationControl({ visualizePitch: true }), 'top-right');
      map.on('load', () => {
        if (!map) return;
        map.addSource('practice-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: activeRoute.coordinates } },
        });
        map.addLayer({
          id: 'practice-route-glow', type: 'line', source: 'practice-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3b82f6', 'line-width': 10, 'line-opacity': 0.22, 'line-blur': 3 },
        });
        map.addLayer({
          id: 'practice-route-line', type: 'line', source: 'practice-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#60a5fa', 'line-width': 5 },
        });
        new mapbox.Marker({ color: '#38bdf8' }).setLngLat(activeRoute.coordinates[0]).setPopup(new mapbox.Popup({ offset: 18 }).setText('მარშრუტის დასაწყისი')).addTo(map!);
        new mapbox.Marker({ color: '#f8fafc' }).setLngLat(activeRoute.coordinates[activeRoute.coordinates.length - 1]).setPopup(new mapbox.Popup({ offset: 18 }).setText('მარშრუტის დასასრული')).addTo(map!);
        const bounds = new mapbox.LngLatBounds();
        activeRoute.coordinates.forEach((point) => bounds.extend(point));
        map!.fitBounds(bounds, { padding: { top: 90, right: 70, bottom: 90, left: 70 }, duration: 0 });
      });
    }).catch(() => setToast('რუკის ჩატვირთვა ვერ მოხერხდა. სცადე გვერდის განახლება.'));

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [activeRoute, screen, token]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const chooseCity = (city: string) => {
    if (city === 'ოზურგეთი') setScreen('routes');
    else {
      setToast('ეს ქალაქი მალე დაემატება!');
      window.setTimeout(() => setToast(''), 2800);
    }
  };

  const openRoute = (routeId: string) => {
    setActiveRouteId(routeId);
    setInstructionIndex(0);
    setScreen('map');
  };

  const nextInstruction = () => {
    const next = (instructionIndex + 1) % activeRoute.directions.length;
    setInstructionIndex(next);
    speakInstruction(activeRoute.directions[next]);
  };

  const pageStyle = { '--glow': 'rgba(37, 99, 235, .17)' } as CSSProperties;

  return (
    <main style={pageStyle} className="min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--glow),transparent_45%)]" />
      <header className="relative z-10 mx-auto flex h-[76px] max-w-7xl items-center justify-between border-b border-white/[0.07] px-5 md:px-10">
        <button className="flex items-center gap-2.5" onClick={() => setScreen('home')} aria-label="martva.ge მთავარი გვერდი">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20"><Navigation size={19} strokeWidth={2.6} /></span>
          <span className="text-lg font-bold tracking-tight">martva<span className="text-blue-400">.ge</span></span>
        </button>
        <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex"><span className="size-1.5 rounded-full bg-emerald-400" /> პრაქტიკისთვის მზად ხარ?</div>
        {screen !== 'home' && <button onClick={() => setScreen(screen === 'map' ? 'routes' : screen === 'routes' ? 'cities' : 'home')} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"><ArrowLeft size={15} /> უკან</button>}
      </header>

      {screen === 'home' && <section className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-center px-5 py-16 md:px-10">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-300"><Sparkles size={14} /> პრაქტიკული გამოცდის რეალისტური გამოცდილება</div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.16] tracking-tight text-white sm:text-5xl md:text-[64px]">მართვის მოწმობის პრაქტიკული გამოცდის <span className="bg-gradient-to-r from-blue-300 to-sky-400 bg-clip-text text-transparent">მზა სიმულატორი</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">აირჩიე ქალაქი, გაიარე შენთვის სასურველი მარშრუტი და მიიღე იდენტური გრძნობა რასაც გამოცდაზე მიიღებ</p>
          <button onClick={() => setScreen('cities')} className="group mt-12 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/75 p-6 text-left shadow-2xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between gap-5">
              <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-blue-300"><MapPin size={15} /> აირჩიე ქალაქი</div><h2 className="text-xl font-semibold text-white sm:text-2xl">აირჩიე ნებისმიერი ქალაქის მარშრუტი</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">აირჩიე ნებისმიერი ქალაქი, გაიარე შენთვის სასურველი მარშრუტი და მიიღე იდენტური გრძნობა რასაც გამოცდაზე მიიღებ</p></div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition group-hover:translate-x-1"><ArrowRight size={21} /></span>
            </div>
          </button>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-500"><span className="flex items-center gap-2"><RouteIcon size={14} /> რეალური მარშრუტები</span><span className="flex items-center gap-2"><AudioLines size={14} /> ხმოვანი მითითებები</span><span className="flex items-center gap-2"><ShieldCheck size={14} /> ივარჯიშე შენს ტემპში</span></div>
        </div>
        <div className="pointer-events-none absolute bottom-16 right-10 hidden size-72 place-items-center rounded-full border border-blue-400/[0.08] lg:grid"><div className="grid size-52 place-items-center rounded-full border border-blue-400/[0.1]"><div className="grid size-32 place-items-center rounded-full border border-blue-400/[0.14] text-blue-400/40"><Compass size={64} strokeWidth={1} /></div></div></div>
      </section>}

      {screen === 'cities' && <section className="relative mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="mb-11 max-w-2xl"><div className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-blue-300">აირჩიე მიმართულება</div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">რომელ ქალაქში ვივარჯიშოთ?</h1><p className="mt-4 text-slate-400">აირჩიე ქალაქი და დაიწყე გამოცდის მარშრუტების გაცნობა.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">{cities.map((city, index) => { const active = city === 'ოზურგეთი'; return <button key={city} onClick={() => chooseCity(city)} className={`group relative min-h-36 overflow-hidden rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 ${active ? 'border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-slate-900 shadow-xl shadow-blue-950/30 hover:border-blue-300/70' : 'border-white/[0.08] bg-slate-900/70 hover:border-white/20 hover:bg-slate-900'}`}><span className={`mb-8 block text-xs font-medium ${active ? 'text-blue-200' : 'text-slate-600'}`}>{String(index + 1).padStart(2, '0')} / 10</span><span className={`block text-lg font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{city}</span>{active ? <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-300">მარშრუტები <ArrowRight size={13} /></span> : <span className="mt-2 block text-xs text-slate-600">მალე</span>}</button>; })}</div>
        <p className="mt-7 text-xs text-slate-500">ამ ეტაპზე ხელმისაწვდომია მხოლოდ ოზურგეთი.</p>
      </section>}

      {screen === 'routes' && <section className="relative mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-blue-300"><MapPin size={14} /> ოზურგეთი, გურია</div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">აირჩიე მარშრუტი</h1><p className="mt-3 text-slate-400">გაეცანი გზას და მოემზადე პრაქტიკული გამოცდისთვის.</p></div><div className="flex items-center gap-2 text-sm text-slate-500"><RouteIcon size={16} /> 3 მარშრუტი</div></div>
        <div className="grid gap-4 md:grid-cols-3">{routes.map((route, index) => <button key={route.id} onClick={() => openRoute(route.id)} className="group rounded-3xl border border-white/[0.09] bg-slate-900/70 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-slate-900"><div className="mb-9 flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300"><RouteIcon size={21} /></span><span className="text-xs font-medium tracking-wide text-slate-600">ROUTE 0{index + 1}</span></div><div className="text-xs font-semibold text-blue-300">{route.name}</div><h2 className="mt-1 text-2xl font-semibold text-white">{route.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{route.description}</p><div className="my-6 h-px bg-white/[0.07]"/><div className="flex items-center gap-5 text-sm text-slate-300"><span className="flex items-center gap-2"><Clock3 size={15} className="text-slate-500" />{route.duration}</span><span className="flex items-center gap-2"><RouteIcon size={15} className="text-slate-500" />{route.distance}</span></div><div className="mt-6 flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition group-hover:bg-blue-500 group-hover:text-white">მარშრუტის დაწყება <ArrowRight size={16} /></div></button>)}</div>
      </section>}

      {screen === 'map' && <section className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-[1600px] flex-col lg:flex-row">
        <aside className="relative z-10 w-full shrink-0 border-b border-white/[0.08] bg-slate-950/90 p-5 backdrop-blur-xl lg:w-[390px] lg:border-b-0 lg:border-r lg:p-7">
          <div className="mb-6"><div className="text-xs font-semibold uppercase tracking-[.16em] text-blue-300">ოზურგეთი · პრაქტიკა</div><h1 className="mt-2 text-2xl font-bold text-white">{activeRoute.title}</h1><p className="mt-2 text-sm text-slate-400">{activeRoute.description}</p></div>
          <div className="mb-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><Clock3 size={17} className="mb-3 text-blue-300"/><div className="text-xs text-slate-500">ხანგრძლივობა</div><div className="mt-1 font-semibold">{activeRoute.duration}</div></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><RouteIcon size={17} className="mb-3 text-blue-300"/><div className="text-xs text-slate-500">მანძილი</div><div className="mt-1 font-semibold">{activeRoute.distance}</div></div></div>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300"><AudioLines size={15}/> შემდეგი მითითება</div><p className="mt-4 min-h-14 text-base leading-7 text-white">{activeRoute.directions[instructionIndex]}</p><div className="mt-4 flex gap-2"><button onClick={() => speakInstruction(activeRoute.directions[instructionIndex])} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"><Volume2 size={16} /> {isSpeaking ? 'ისმინება…' : 'მოსმენა'}</button><button onClick={nextInstruction} aria-label="შემდეგი მითითება" className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10"><ArrowDownRight size={18}/></button></div><p className="mt-3 text-[11px] leading-5 text-slate-500">ხმოვანი მითითებები ბრაუზერის SpeechSynthesis-ით იკითხება.</p></div>
          <div className="mt-6"><div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">სხვა მარშრუტები</div><div className="space-y-2">{routes.filter(route => route.id !== activeRouteId).map(route => <button key={route.id} onClick={() => openRoute(route.id)} className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-left text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04]"><span>{route.name} · {route.title}</span><ArrowRight size={15} className="text-slate-500"/></button>)}</div></div>
        </aside>
        <div className="relative min-h-[55vh] flex-1 bg-slate-900 lg:min-h-0"><div ref={mapContainer} className="absolute inset-0" />{!token && <div className="absolute inset-0 grid place-items-center bg-slate-900 p-6 text-center"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-2xl"><MapPin size={30} className="mx-auto text-blue-300"/><h2 className="mt-4 text-xl font-semibold text-white">Mapbox ტოკენი საჭიროა</h2><p className="mt-3 text-sm leading-6 text-slate-400">რუკის გასააქტიურებლად პროექტის გარემოში დაამატე <code className="rounded bg-white/10 px-1.5 py-1 text-blue-200">NEXT_PUBLIC_MAPBOX_TOKEN</code> და განაახლე გვერდი.</p></div></div>}<div className="pointer-events-none absolute bottom-5 left-5 hidden rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-slate-300 backdrop-blur sm:block">ლურჯი ხაზი · {activeRoute.distance}</div></div>
      </section>}

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </main>
  );
}
