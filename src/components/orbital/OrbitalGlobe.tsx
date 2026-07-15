'use client';

import { Minus, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GlobeMethods } from 'react-globe.gl';
import {
  AdditiveBlending,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from 'three';
import type { Startup } from '@/interface/startup';
import { resolveMediaUrl } from '@/services/mediaService';
import { isCurrentlyFeatured } from '@/utils/featured';
import { useHydrated } from '@/hooks/useHydrated';

// three.js cannot run during SSR; the globe only ever renders in the browser.
const Globe = dynamic(() => import('@/components/orbital/GlobeWrapper'), { ssr: false });

interface GlobePoint {
  lat: number;
  lng: number;
  id: string;
  name: string;
  city?: string;
  country?: string;
  logo?: string;
  featured: boolean;
}

interface CountryFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: unknown;
}

interface OrbitalGlobeProps {
  startups: Startup[];
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OrbitalGlobe: React.FC<OrbitalGlobeProps> = ({ startups }) => {
  const router = useRouter();
  const hydrated = useHydrated();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/geo/countries.geojson');
        const data = (await response.json()) as { features: CountryFeature[] };
        if (!cancelled) setCountries(data.features);
      } catch (error) {
        console.error('Unable to load the world outline:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const points = useMemo<GlobePoint[]>(
    () =>
      startups.flatMap((startup) => {
        if (startup.latitude === undefined || startup.longitude === undefined) return [];
        const point: GlobePoint = {
          lat: startup.latitude,
          lng: startup.longitude,
          id: startup.id,
          name: startup.name,
          featured: isCurrentlyFeatured(startup),
        };
        if (startup.city) point.city = startup.city;
        if (startup.country) point.country = startup.country;
        const logo = resolveMediaUrl(startup.logo);
        if (logo) point.logo = logo;
        return [point];
      }),
    [startups],
  );

  const globeMaterial = useMemo(
    () => new MeshPhongMaterial({ color: '#0a0a0a', transparent: true, opacity: 0.95 }),
    [],
  );

  const handleReady = () => {
    const globe = globeRef.current;
    if (!globe) return;
    // Start closer than the library default (altitude 2.5).
    globe.pointOfView({ altitude: 1.5 });
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = true;
    // Globe radius is 100; keep the camera between altitude ~0.5 and ~4.
    controls.minDistance = 150;
    controls.maxDistance = 500;
  };

  const handlePointHover = (point: object | null) => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    // Pause the auto-rotation while a startup marker is hovered.
    controls.autoRotate = !point;
  };

  const zoomBy = (factor: number) => {
    const globe = globeRef.current;
    if (!globe) return;
    const { lat, lng, altitude } = globe.pointOfView();
    const nextAltitude = Math.min(4, Math.max(0.5, altitude * factor));
    globe.pointOfView({ lat, lng, altitude: nextAltitude }, 300);
  };

  // Fallback marker: a glowing sphere (solid core plus additive halo).
  const addGlowSphere = (group: Group, color: string) => {
    group.add(new Mesh(new SphereGeometry(1.1, 16, 16), new MeshBasicMaterial({ color })));
    group.add(
      new Mesh(
        new SphereGeometry(2.2, 16, 16),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.28,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
  };

  // Logo marker: the startup logo clipped to a circle,
  // rendered as a billboard sprite so it always faces the camera.
  const addLogoSprite = (group: Group, logo: string, fallbackColor: string) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 128, 128);
      ctx.drawImage(image, 6, 6, 116, 116);
      ctx.restore();

      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      const sprite = new Sprite(new SpriteMaterial({ map: texture, depthWrite: false }));
      sprite.scale.set(5, 5, 1);
      group.clear();
      group.add(sprite);
    };
    image.onerror = () => {
      group.clear();
      addGlowSphere(group, fallbackColor);
    };
    image.src = logo;
  };

  const markerObject = (point: object) => {
    const p = point as GlobePoint;
    const color = p.featured ? '#fbbf24' : '#14F195';
    const group = new Group();
    // Sphere shows immediately; the sprite replaces it once the logo loads.
    addGlowSphere(group, color);
    if (p.logo) addLogoSprite(group, p.logo, color);
    return group;
  };

  const markerObjectUpdate = (obj: object, point: object) => {
    const coords = globeRef.current?.getCoords((point as GlobePoint).lat, (point as GlobePoint).lng, 0.025);
    if (coords) Object.assign((obj as Group).position, coords);
  };

  const pointLabel = (point: object) => {
    const p = point as GlobePoint;
    const location = [p.city, p.country].flatMap((part) => (part ? [escapeHtml(part)] : [])).join(', ');
    const logo = p.logo
      ? `<img src="${escapeHtml(p.logo)}" alt="" style="width:32px;height:32px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;" />`
      : `<div style="width:32px;height:32px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:#000;color:rgba(255,255,255,0.3);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${escapeHtml(p.name.slice(0, 2).toUpperCase())}</div>`;
    return `
      <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.15);border-radius:14px;padding:10px 14px;font-family:inherit;pointer-events:none;display:flex;align-items:center;gap:10px;">
        ${logo}
        <div>
          <div style="color:#fff;font-weight:700;white-space:nowrap;">${escapeHtml(p.name)}${p.featured ? ' <span style="color:#fbbf24;">★</span>' : ''}</div>
          ${location ? `<div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:2px;white-space:nowrap;">📍 ${location}</div>` : ''}
        </div>
      </div>
    `;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex size-full cursor-grab items-center justify-center active:cursor-grabbing">
      {hydrated && size.width > 0 && (
        <Globe
          globeRef={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showGraticules={false}
          atmosphereColor="#9945FF"
          atmosphereAltitude={0.18}
          hexPolygonsData={countries}
          hexPolygonResolution={3}
          hexPolygonMargin={0.72}
          hexPolygonUseDots
          hexPolygonColor={() => 'rgba(255,255,255,0.28)'}
          customLayerData={points}
          customThreeObject={markerObject}
          customThreeObjectUpdate={markerObjectUpdate}
          customLayerLabel={pointLabel}
          onCustomLayerClick={(point: object) => router.push(`/startups/${(point as GlobePoint).id}`)}
          onCustomLayerHover={handlePointHover}
          onGlobeReady={handleReady}
        />
      )}
      {hydrated && (
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomBy(0.7)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]/80 text-white backdrop-blur transition-colors hover:border-[#9945FF]">
            <Plus className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomBy(1.4)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]/80 text-white backdrop-blur transition-colors hover:border-[#9945FF]">
            <Minus className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrbitalGlobe;
