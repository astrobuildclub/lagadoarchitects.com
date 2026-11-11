// Kleurkiezer voor hex-velden in de Studio. De waarde blijft een hex-string (#rrggbb of #rgb),
// dus geen modelwijziging: de native kiezer staat naast het gewone tekstveld.
import { set, unset, type StringInputProps } from 'sanity';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** De native kiezer kent alleen #rrggbb; #rgb uitschrijven. */
function voluit(hex: string): string {
  return hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
}

export function KleurInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const geldig = typeof value === 'string' && HEX.test(value);

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="color"
        aria-label="Kies een kleur"
        value={geldig ? voluit(value).toLowerCase() : '#000000'}
        disabled={readOnly}
        onChange={(e) => onChange(set(e.currentTarget.value))}
        style={{
          inlineSize: '2.5rem',
          blockSize: '2.25rem',
          padding: 0,
          border: '1px solid var(--card-border-color, #ccc)',
          borderRadius: '3px',
          background: 'none',
          cursor: readOnly ? 'default' : 'pointer',
          opacity: geldig ? 1 : 0.35,
          flex: 'none',
        }}
      />
      <div style={{ flex: 1 }}>{props.renderDefault({ ...props, elementProps: { ...elementProps, placeholder: '#1f4fd1' } })}</div>
      {value && !readOnly ? (
        <button
          type="button"
          onClick={() => onChange(unset())}
          style={{ font: 'inherit', fontSize: '0.8125rem', background: 'none', border: 0, cursor: 'pointer', textDecoration: 'underline', flex: 'none' }}
        >
          Leegmaken
        </button>
      ) : null}
    </div>
  );
}
