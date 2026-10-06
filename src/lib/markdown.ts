// `tekst`-velden zijn korte markdown (alinea's, nadruk, links). Bron is onze eigen content.
import { marked } from 'marked';

export const md = (input: string | undefined) => (input ? (marked.parse(input.trim(), { async: false }) as string) : '');
export const mdInline = (input: string | undefined) =>
  input ? (marked.parseInline(input.trim(), { async: false }) as string) : '';
