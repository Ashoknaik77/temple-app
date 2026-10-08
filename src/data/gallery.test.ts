/** Unit tests for admin gallery uploads (local backend — no network). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  deleteGalleryPhoto,
  getGalleryPhotos,
  initData,
  saveGalleryPhoto,
} from './mock';

beforeEach(async () => {
  localStorage.clear();
  await initData({ backend: 'local' });
});

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('gallery photos', () => {
  it('starts empty', () => {
    expect(getGalleryPhotos()).toHaveLength(0);
  });

  it('saves a photo with caption and audit fields', async () => {
    const p = await saveGalleryPhoto({ dataUrl: tinyPng, caption: 'Test' }, 'Srini');
    expect(p.id).toBeTruthy();
    expect(p.caption).toBe('Test');
    expect(p.uploadedBy).toBe('Srini');
    expect(p.uploadedAt).toBeTruthy();
    expect(getGalleryPhotos()).toHaveLength(1);
  });

  it('rejects non-image data URLs', async () => {
    await expect(saveGalleryPhoto({ dataUrl: 'data:text/plain,hi' })).rejects.toThrow(
      'invalid photo',
    );
  });

  it('rejects oversized data URLs (Firestore 1 MiB safety)', async () => {
    const big = 'data:image/jpeg;base64,' + 'A'.repeat(700_001);
    await expect(saveGalleryPhoto({ dataUrl: big })).rejects.toThrow('photo too large');
  });

  it('deletes a photo', async () => {
    const p = await saveGalleryPhoto({ dataUrl: tinyPng });
    await deleteGalleryPhoto(p.id);
    expect(getGalleryPhotos()).toHaveLength(0);
  });

  it('returns newest first', async () => {
    const a = await saveGalleryPhoto({ dataUrl: tinyPng, caption: 'first' });
    await new Promise((r) => setTimeout(r, 5));
    const b = await saveGalleryPhoto({ dataUrl: tinyPng, caption: 'second' });
    const list = getGalleryPhotos();
    expect(list[0].id).toBe(b.id);
    expect(list[1].id).toBe(a.id);
  });
});
