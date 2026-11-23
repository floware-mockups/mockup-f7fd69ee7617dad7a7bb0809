// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GraficoScadenzeStati");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GraficoScadenzeStati");
import { useState } from "react";
import { Card, Button, useTable, usePrototype } from "../floware";

export default function GraficoScadenzeStati(props) {__mk();
  const table = useTable(props.pageId || undefined);
  const { openDetail } = usePrototype();
  const [selezione, setSelezione] = useState({ pagina: "", stato: "" });
  if (!table || !["dashboard", "registro-pratiche", "controlli-da-fare"].includes(table.id)) return null;
  const stato = table.column("Stato");
  const pratica = table.column("Pratica");
  if (stato < 0) return <Card title="Pratiche per stato"><p>La colonna Stato non è disponibile.</p></Card>;
  const righe = table.rows.map((riga, indice) => ((__mk(), { indice, stato: (riga[stato] || "").trim() || "Senza stato", nome: pratica >= 0 ? riga[pratica] || "Pratica senza riferimento" : "Riga " + (indice + 1) })));
  const nomi = [...new Set(righe.map((riga) => (__mk(), riga.stato)))];
  const totale = righe.length;
  let cumulato = 0;
  const gruppi = nomi.map((nome, indice) => {__mk();
    const valore = righe.filter((riga) => (__mk(), riga.stato === nome)).length;
    const quota = valore / totale;
    const inizio = cumulato * Math.PI * 2 - Math.PI / 2;
    cumulato += quota;
    const fine = cumulato * Math.PI * 2 - Math.PI / 2;
    const mezzo = (inizio + fine) / 2;
    const percorso = "M 150 150 L " + (150 + 126 * Math.cos(inizio)) + " " + (150 + 126 * Math.sin(inizio)) + " A 126 126 0 " + (quota > 0.5 ? 1 : 0) + " 1 " + (150 + 126 * Math.cos(fine)) + " " + (150 + 126 * Math.sin(fine)) + " Z";
    return { nome, valore, quota, percorso, x: 150 + 83 * Math.cos(mezzo), y: 150 + 83 * Math.sin(mezzo), numero: indice + 1, opacita: 0.4 + (indice % 6) * 0.12 };
  });
  const attivo = selezione.pagina === table.id && nomi.includes(selezione.stato) ? selezione.stato : "";
  const visibili = righe.filter((riga) => (__mk(), riga.stato === attivo));
  const percentuale = (quota) => (__mk(), new Intl.NumberFormat("it-IT", { style: "percent", maximumFractionDigits: 1 }).format(quota));
  return <Card title="Pratiche per stato">
    <div className="space-y-4 text-(--mk-text)">
      <p className="text-sm text-(--mk-muted)">{table.title} · {totale} pratiche. Dati aggiornati automaticamente dalla tabella della pagina, indipendentemente dai filtri dell’elenco.</p>
      {!totale ? <p>Nessuna pratica da rappresentare.</p> : <div className="flex flex-wrap items-center gap-6">
        <div style={{ width: "19rem", maxWidth: "100%" }}>
          <svg viewBox="0 0 300 300" role="img" aria-label={"Distribuzione per stato di " + totale + " pratiche"} style={{ width: "100%", height: "auto" }}>
            <title>Pratiche per stato: valori e percentuali nella legenda</title>
            {gruppi.map((gruppo) => (__mk(), <g key={gruppo.nome}>
              <title>{gruppo.nome + ": " + gruppo.valore + " (" + percentuale(gruppo.quota) + ")"}</title>
              {gruppo.quota === 1 ? <circle cx={150} cy={150} r={126} fill="var(--mk-primary)" fillOpacity={gruppo.opacita} stroke="var(--mk-surface)" strokeWidth={3} /> : <path d={gruppo.percorso} fill="var(--mk-primary)" fillOpacity={gruppo.opacita} stroke={attivo === gruppo.nome ? "var(--mk-text)" : "var(--mk-surface)"} strokeWidth={attivo === gruppo.nome ? 4 : 2} />}
              {gruppo.quota >= 0.06 && <g><circle cx={gruppo.x} cy={gruppo.y} r={13} fill="var(--mk-surface)" /><text x={gruppo.x} y={gruppo.y + 4} textAnchor="middle" fill="var(--mk-text)" fontSize={12}>{gruppo.numero}</text></g>}
            </g>))}
          </svg>
        </div>
        <div className="space-y-2 flex-1" style={{ minWidth: "15rem" }}>
          <p className="text-sm text-(--mk-muted)">Seleziona uno stato per vedere le pratiche. I numeri collegano le fette alla legenda.</p>
          {gruppi.map((gruppo) => (__mk(), <div key={gruppo.nome} className="flex flex-wrap items-center justify-between gap-2 border-b border-(--mk-divider) py-2">
            <Button variant={attivo === gruppo.nome ? "primary" : "secondary"} onClick={() => (__mk(), setSelezione({ pagina: table.id, stato: attivo === gruppo.nome ? "" : gruppo.nome }))}>{gruppo.numero + ". " + gruppo.nome}</Button>
            <span>{gruppo.valore} · {percentuale(gruppo.quota)}</span>
          </div>))}
        </div>
      </div>}
      {attivo && <div className="space-y-2 border-t border-(--mk-divider) pt-3">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{attivo} · {visibili.length} pratiche</h3><Button variant="secondary" onClick={() => (__mk(), setSelezione({ pagina: "", stato: "" }))}>Chiudi elenco</Button></div>
        <div className="space-y-2 overflow-auto" style={{ maxHeight: "18rem" }}>{visibili.map((riga) => (__mk(), <div key={riga.indice} className="flex items-center justify-between gap-3 rounded border border-(--mk-border) p-2"><span>{riga.nome}</span><Button variant="link" onClick={() => (__mk(), openDetail(table.id, riga.indice))}>Apri</Button></div>))}</div>
      </div>}
    </div>
  </Card>;
}
