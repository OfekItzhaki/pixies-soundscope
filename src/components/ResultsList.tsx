import type { ReactElement } from 'react';

import type { Track } from '../api/types';

interface ResultsListProps {
  tracks: Track[];
  onSelectTrack(track: Track): void;
}

export function ResultsList({ tracks, onSelectTrack }: ResultsListProps): ReactElement | null {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className="results-section" aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      <ul className="results-list">
        {tracks.map((track) => (
          <li key={track.id} className="result-item">
            <button type="button" className="result-button" onClick={() => onSelectTrack(track)}>
              <span className="result-title">{track.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
