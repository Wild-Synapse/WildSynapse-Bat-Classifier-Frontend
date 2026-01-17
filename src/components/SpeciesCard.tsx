import React from 'react';

interface SpeciesProps {
  rank?: number;
  species: string;
  confidence: number;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function SpeciesCard({ rank, species, confidence }: SpeciesProps) {
  const src = `/species/${slugify(species)}.jpg`;

  return (
    <div className="flex items-center space-x-4 bg-slate-900/40 rounded-lg p-3">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-700 to-purple-600 border border-purple-500/20">
        <img
          src={src}
          alt={species}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.onerror = null;
            el.src = '/bat.jpg';
          }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-purple-300 font-semibold">{species}</div>
            <div className="text-xs text-gray-400">Rank #{rank ?? '-'}</div>
          </div>
          <div className="text-sm font-bold text-white">{confidence.toFixed(2)}%</div>
        </div>

        <div className="mt-2 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${Math.min(confidence, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
