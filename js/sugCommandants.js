/* =====================================================================
   js/sugCommandants.js — Les commandants du deck, en tête de l'onglet EDHREC
   ===================================================================== */

/* ---------------------------------------------------------------------
   Les commandants du deck, en tête de l'onglet EDHREC.

   Le deck peut porter plusieurs créatures légendaires : l'une commande, les
   autres pourraient. EDHREC publie une page par commandant, et l'atelier les
   croise toutes — mais toutes ne méritent pas de peser sur le classement. La
   liste les montre donc une par ligne, chacune cochée ou non : décocher retire
   ses statistiques du croisement, cocher les redemande.

   Le commandant principal n'est pas de cette liste : il se désigne dans
   l'onglet Deck, et sa ligne le dit — elle ouvre sa fiche et sa page EDHREC,
   rien de plus.
   --------------------------------------------------------------------- */

/* Le nombre de decks recensés par EDHREC pour un commandant, et le lien vers
   sa page — le décompte est le lien : c'est là qu'on veut aller quand on le
   lit. Sans statistiques, il n'y a rien à compter mais la page existe tout de
   même, et le lien y mène. */
function lienDecksEdhrec(nom, actif) {
  const e = S.edhrec || {};
  const d = (e.data && e.data.commandant === nom) ? e.data
    : (e.secondaires || []).find(x => x.commandant === nom);
  const url = (d && d.url) || ('https://edhrec.com/commanders/' + edhrecSlug(nom));
  const page = `ouvrir la page EDHREC de ${nom}`;
  let txt, aide;
  if (!actif)                                  { txt = 'écarté';      aide = `Ce commandant est écarté du croisement — ${page}`; }
  else if (d && d.status !== 'error' && d.total) { txt = `${d.total.toLocaleString('fr-FR')} decks`; aide = `${d.total.toLocaleString('fr-FR')} decks recensés — ${page}`; }
  else if (d && d.status === 'error')          { txt = 'absent';      aide = `${d.error || "absent d'EDHREC"} — ${page}`; }
  else if (e.status === 'loading')             { txt = 'chargement…'; aide = `Statistiques en cours de chargement — ${page}`; }
  else                                         { txt = '—';           aide = `Statistiques non chargées — ${page}`; }
  return `<a class="cmd-d" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(aide)}">${esc(txt)} ↗</a>`;
}

/* Une ligne : la marque à gauche — l'étoile d'un principal, la case d'un
   secondaire —, le nom au milieu, le décompte à droite. Le nom ouvre la fiche
   au clic et montre le visuel au survol (`montrerApercu`, js/app.js, qui suit
   les éléments portant `data-act="fiche"`). */
function ligneCommandant(carte, principal) {
  const nom = carte.name;
  const actif = principal || !S.secondairesOff.has(nom);
  const marque = principal
    ? `<span class="cmd-b etoile" title="Commandant principal, désigné dans l'onglet Deck">★</span>`
    : `<input type="checkbox" class="coche" data-act="cmdSecondaire" data-name="${esc(nom)}" ${actif ? 'checked' : ''}
        aria-label="Traiter ${esc(nom)} comme commandant secondaire"
        title="${actif ? "Décocher : les statistiques EDHREC de cette carte quittent le croisement"
                       : "Cocher : les statistiques EDHREC de cette carte entrent dans le croisement"}">`;
  return `<li class="cmd-l ${actif ? 'on' : 'off'}">
    ${marque}
    <button type="button" class="cmd-n" data-act="fiche" data-name="${esc(nom)}"
      title="Ouvrir la fiche de ${esc(nom)} — le visuel paraît au survol">${esc(nom)}</button>
    ${lienDecksEdhrec(nom, actif)}
  </li>`;
}

function blocCommandants(principaux, secPossibles) {
  const retenus = secPossibles.filter(c => !S.secondairesOff.has(c.name)).length;
  return `<div class="cmd-bloc">
    <div class="cmd-titre small"><b>Commandant principal</b></div>
    <ul class="cmd-rows">
      ${principaux.length
        ? principaux.map(c => ligneCommandant(c, true)).join('')
        : `<li class="cmd-l off">
            <span class="cmd-b etoile">★</span>
            <span class="cmd-n muted">Aucun commandant désigné</span>
            <button type="button" class="btn sm" data-onglet="deck">Le désigner dans l'onglet Deck</button>
          </li>`}
    </ul>
    <div class="cmd-titre small" style="margin-top:8px"><b>Commandants secondaires</b>
      <span class="muted">${secPossibles.length
        ? `· ${retenus} retenu(s) sur ${secPossibles.length}`
        : '· aucune autre carte du deck ne peut commander'}</span></div>
    ${secPossibles.length ? `<ul class="cmd-rows">
      ${secPossibles.map(c => ligneCommandant(c, false)).join('')}
    </ul>
    <div class="small muted" style="margin-top:4px">Décocher une carte retire ses statistiques du croisement — ses recommandations et ses étiquettes disparaissent, et les scores sont repris. Elle reste dans le deck.</div>` : ''}
  </div>`;
}

function panneauEdhrec() {
  const f = fmt();
  if (!f.commander) return '';
  const e = S.edhrec, cmd = S.commander ? find(S.commander) : null;
  const principaux = commandantsPrincipaux();
  const secPossibles = commandantsSecondairesPossibles();
  const secCmds = commandantsSecondaires();
  const sansDonnees = !e.data && (!e.secondaires || !e.secondaires.length);

  /* Ce qu'EDHREC répond, selon l'état. La liste des commandants, elle, paraît
     dans tous les cas : c'est par elle qu'on choisit ce qui sera demandé, et
     la faire disparaître au premier échec interdirait de rien y changer. */
  const corps = (() => {
    if (!cmd && !secPossibles.length)
      return `<div class="small muted">Désignez un commandant depuis <button type="button" class="btn sm" data-onglet="deck">l'onglet Deck</button> ou ajoutez des créatures légendaires au deck pour croiser les suggestions avec les statistiques d'EDHREC.</div>`;

    if (e.status === 'loading')
      return `<div class="small muted">Chargement des statistiques EDHREC${cmd ? ` pour ${esc(cmd.name)}` : ''}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}…</div>`;

    if (e.status === 'error' && sansDonnees)
      return `<div class="small">Statistiques indisponibles (${esc(e.error||'')}). Le site n'autorise pas forcément la requête depuis un navigateur tiers, ou la page peut ne pas exister pour ce commandant.</div>
        <div class="row" style="gap:6px;margin-top:6px">
          <button class="btn sm" data-act="edhrec" data-force="1">Réessayer</button>
          ${cmd ? `<a class="btn sm" href="https://edhrec.com/commanders/${esc(e.slug||edhrecSlug(cmd.name))}" target="_blank" rel="noopener">Ouvrir la page EDHREC ↗</a>` : ''}
        </div>`;

    if (e.status !== 'ok' && sansDonnees)
      return `<div class="small muted">Croiser les suggestions avec les decks recensés pour ${cmd ? esc(cmd.name) : 'vos commandants'}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}.</div>
        <div class="row" style="margin-top:6px"><button class="btn sm" data-act="edhrec">Charger les statistiques</button></div>`;

    const d = e.data;
    let absentes = [];
    if (d && d.map) {
      const connues = [...new Set([...d.map.values()])];
      absentes = connues
        .filter(r => { const c = find(r.name); return !c || ((S.collection.get(c.name) || 0) === 0 && !S.deck.has(c.name)); })
        .sort((a, b) => b.inclusion - a.inclusion).slice(0, 6);
    }

    return `<div class="small muted">Les cartes recommandées par EDHREC (pour votre commandant principal ou vos commandants secondaires) sont réunies ci-dessous ; elles portent partout ailleurs l'étiquette <b>edhrec</b>, avec leur taux d'inclusion et leur synergie.</div>
      ${absentes.length ? `<div class="small" style="margin-top:8px">Fréquentes chez ${esc(d.commandant)} mais absentes de votre collection :
        ${absentes.map(r => `<span class="chip" title="synergie ${r.synergy>=0?'+':'−'}${Math.abs(Math.round(r.synergy*100))} %">${esc(r.name)} — ${Math.round(r.inclusion*100)} %</span>`).join(' ')}</div>` : ''}
      <div class="row" style="gap:6px;margin-top:8px">
        <button class="btn sm" data-act="edhrec" data-force="1">Rafraîchir</button>
        ${d ? `<a class="btn sm" href="${esc(d.url)}" target="_blank" rel="noopener">Page EDHREC (${esc(d.commandant)}) ↗</a>` : ''}
      </div>`;
  })();

  /* Le titre ne nomme plus le commandant : la liste, juste dessous, les nomme
     tous et dit ce que chacun pèse. */
  return `<div class="group" style="border-color:#2f6b68">
    <h4>Commandants EDHREC</h4>
    ${blocCommandants(principaux, secPossibles)}
    ${corps}
  </div>`;
}
