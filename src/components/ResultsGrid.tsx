import type { ReactElement } from 'react';

import type { Track } from '../api/types';

interface ResultsGridProps {
  tracks: Track[];
  onSelectTrack(track: Track, sourceElement: HTMLElement): void;
}

export function ResultsGrid({ tracks, onSelectTrack }: ResultsGridProps): ReactElement | null {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className="results-section" aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      <ul className="results-grid" aria-label="Search results in tile view">
        {tracks.map((track) => (
          <li key={track.id} className="result-tile">
            <button
              type="button"
              className="result-tile-button"
              onClick={(event) => onSelectTrack(track, event.currentTarget)}
              aria-label={`Select ${track.title}`}
            >
              <span className="result-tile-image-wrap">
                {track.imageUrl ? (
                  <img src={track.imageUrl} alt="" className="result-tile-image" />
                ) : (
                  <span className="result-tile-placeholder">No image</span>
                )}
              </span>
              <span className="result-title">{track.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
