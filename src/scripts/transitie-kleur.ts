// Paginatransitie in de kleur van het project (Interlude, curtain-lagado).
//
// Hoe het werkt:
// - Links naar een project (ProjectCard, NextProject) dragen hun projectkleur in
//   `data-transitie-kleur`.
// - Bij `interlude:leave` kijken we of de navigatie door zo'n link is gestart (`context.trigger`).
//   Zo ja, dan zetten we `--interlude-color` op de Interlude-laag (`context.root`): het vlak dat
//   de pagina bedekt en weer onthult krijgt die kleur. De engine zelf blijft onaangeroerd.
// - Bij `interlude:idle` halen we hem weg, zodat andere navigaties de standaardkleur houden
//   (`--interlude-color` in tokens.scss). Terug/vooruit in de geschiedenis heeft geen link: standaardkleur.
const KLEUR = '--interlude-color';

document.addEventListener('interlude:leave', (e) => {
  const { trigger, root } = e.detail;
  const kleur = trigger?.closest<HTMLElement>('[data-transitie-kleur]')?.dataset.transitieKleur;
  if (kleur) root.style.setProperty(KLEUR, kleur);
  else root.style.removeProperty(KLEUR);
});

document.addEventListener('interlude:idle', (e) => e.detail.root.style.removeProperty(KLEUR));

export {};
