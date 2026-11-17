// De woordmerk-editor als invoer voor het veld `data` van een woordmerkanimatie. De editor zelf is de pagina
// /brand/editor (src/scripts/woordmerk-editor.ts), hier in een iframe met ?ingebed. Ze praten via postMessage:
// - editor → Studio: { type: 'woordmerk:gereed' } bij het starten, { type: 'woordmerk:wijziging', data } na een bewerking
// - Studio → editor: { type: 'woordmerk:laad', data, alleenLezen } bij het starten en als de waarde van buitenaf
//   verandert (ongedaan maken of een oudere versie terugzetten in de Studio)
// Studio en site staan op hetzelfde domein; berichten van elders worden genegeerd.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { set, type TextInputProps } from 'sanity';

type Bericht = { type: 'woordmerk:gereed' } | { type: 'woordmerk:sluit' } | { type: 'woordmerk:wijziging'; data: string };

export function WoordmerkInput(props: TextInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const frame = useRef<HTMLIFrameElement>(null);
  /** Laatste waarde die de editor kent, zodat zijn eigen wijziging niet terugkaatst. */
  const bekend = useRef<string | undefined>(undefined);
  /**
   * Volledig scherm: via een portal op document.body, zodat geen transform of overflow van de Studio-panelen
   * hem inperkt. De iframe laadt dan opnieuw en krijgt de huidige waarde (de ongedaan-geschiedenis van de
   * editor begint opnieuw; die van de Studio blijft).
   */
  const [groot, setGroot] = useState(false);

  useEffect(() => {
    if (!groot) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setGroot(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [groot]);

  const stuur = useCallback(
    (data: string | undefined) => {
      bekend.current = data;
      frame.current?.contentWindow?.postMessage({ type: 'woordmerk:laad', data: data ?? '', alleenLezen: !!readOnly }, location.origin);
    },
    [readOnly],
  );

  useEffect(() => {
    const ontvang = (e: MessageEvent<Bericht>) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'woordmerk:gereed') stuur(value);
      if (e.data?.type === 'woordmerk:sluit') setGroot(false);
      if (e.data?.type === 'woordmerk:wijziging' && !readOnly && e.data.data !== bekend.current) {
        bekend.current = e.data.data;
        onChange(set(e.data.data));
      }
    };
    window.addEventListener('message', ontvang);
    return () => window.removeEventListener('message', ontvang);
  }, [value, readOnly, onChange, stuur]);

  // Van buitenaf gewijzigd (ongedaan maken, versie terugzetten): opnieuw laden in de editor.
  useEffect(() => {
    if (value !== bekend.current) stuur(value);
  }, [value, stuur]);

  // Op volledig scherm staat de knop buiten de Studio-thema's (portal op body): eigen, donkere kleuren.
  const knop = {
    font: 'inherit',
    fontSize: '0.8125rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '999px',
    cursor: 'pointer',
    ...(groot
      ? { border: '1px solid #f2f2f2', background: '#f2f2f2', color: '#111' }
      : { border: '1px solid var(--card-border-color, #ccc)', background: 'transparent', color: 'inherit' }),
  } as const;

  const inhoud = (
    <div
      style={
        groot
          ? { position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', flexDirection: 'column', background: '#111' }
          : { display: 'flex', flexDirection: 'column' }
      }
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: groot ? '0.75rem 1.25rem' : '0 0 0.5rem' }}>
        <button type="button" style={knop} onClick={() => setGroot((g) => !g)} aria-pressed={groot}>
          {groot ? 'Sluiten (Esc)' : 'Volledig scherm'}
        </button>
      </div>
      <iframe
        ref={frame}
        id={elementProps.id}
        src="/brand/editor?ingebed"
        title="Woordmerk-editor"
        style={{
          display: 'block',
          inlineSize: '100%',
          blockSize: groot ? 'auto' : 'min(1100px, 85vh)',
          flex: groot ? 1 : undefined,
          border: groot ? 0 : '1px solid var(--card-border-color, #ccc)',
          borderRadius: groot ? 0 : '3px',
        }}
      />
    </div>
  );

  return groot ? (
    <>
      <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.7 }}>De editor staat op volledig scherm.</p>
      {createPortal(inhoud, document.body)}
    </>
  ) : (
    inhoud
  );
}
