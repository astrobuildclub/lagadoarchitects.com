// Sanity-beelden via @sanity/image-url + srcset (standards/IMAGES.md, profiel "Website").
// Niet via Astro <Image>: dat downloadt het origineel en herschaalt het nog een keer.
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImage } from '../schema';

const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
});

const WIDTHS = [480, 768, 1080, 1440, 1920, 2400];
const MAX_WIDTH = 2560;
const QUALITY = 75;

/** Geef het hele beeld-object mee (niet alleen `asset`): de builder past crop en hotspot dan zelf toe. */
export const urlFor = (image: SanityImage) =>
  builder.image({ asset: { _ref: image.asset._id }, crop: image.crop ?? undefined, hotspot: image.hotspot ?? undefined });

/** Afmetingen na de crop uit de Studio; daarop rekenen width/height en de breedtestappen. */
export function dimensions(image: SanityImage) {
  const { width, height } = image.asset.metadata.dimensions;
  const c = image.crop;
  if (!c) return { width, height };
  return {
    width: Math.round(width * (1 - (c.left ?? 0) - (c.right ?? 0))),
    height: Math.round(height * (1 - (c.top ?? 0) - (c.bottom ?? 0))),
  };
}

/** `src`, `srcset`, `width` en `height` voor een <img>. `widths` overschrijft de standaardstappen. */
export function imageProps(image: SanityImage, { sizes = '100vw', widths = WIDTHS }: { sizes?: string; widths?: number[] } = {}) {
  const { width, height } = dimensions(image);
  const max = Math.min(width, MAX_WIDTH);
  const steps = [...new Set([...widths.filter((w) => w < max), max])];
  const build = (w: number) => urlFor(image).width(w).fit('max').auto('format').quality(QUALITY).url();
  return {
    src: build(Math.min(1280, max)),
    srcset: steps.map((w) => `${build(w)} ${w}w`).join(', '),
    sizes,
    width,
    height,
  };
}

/** Eén URL op een vaste breedte (lightbox, video-poster). */
export const imageUrl = (image: SanityImage, width: number) =>
  urlFor(image).width(Math.min(width, dimensions(image).width)).fit('max').auto('format').quality(QUALITY).url();

/** Bijgesneden op een vast formaat, rond de hotspot (deelafbeelding 1200×630). */
export const croppedUrl = (image: SanityImage, width: number, height: number, format: 'jpg' | 'png' = 'jpg') =>
  urlFor(image).width(width).height(height).fit('crop').format(format).quality(80).url();

/** Hotspot als `object-position`, voor beelden die met CSS worden bijgesneden. */
export const focalPoint = (image: SanityImage) =>
  image.hotspot?.x != null && image.hotspot?.y != null ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` : undefined;
