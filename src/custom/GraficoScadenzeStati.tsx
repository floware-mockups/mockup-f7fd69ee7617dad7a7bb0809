// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GraficoScadenzeStati");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GraficoScadenzeStati");
import { Card, Button, useTable, usePrototype } from "../floware";

function leggiData(testo) {__mk();
  const valore = testo.trim();
  const italiana = valore.includes("/");
  const parti = valore.split(italiana ? "/" : "-");
  if (parti.length !== 3) return null;
  const indiceGiorno = italiana ? 0 : 2;
  const indiceAnno = italiana ? 2 : 0;
  const giorno = Number(parti[indiceGiorno]);
  const mese = Number(parti[1]);
  const anno = Number(parti[indiceAnno]);
  if (!Number.isInteger(giorno) || !Number.isInteger(mese) || !Number.isInteger(anno) || anno < 1900 || anno > 9999) return null;
  const data = new Date(Date.UTC(anno, mese - 1, giorno));
  if (data.getUTCDate() !== giorno || data.getUTCMonth() !== mese - 1 || data.getUTCFullYear() !== anno) return null;
  return data.getTime();
}

export default function GraficoScadenzeStati(props) {__mk();
  const table = useTable(props.pageId);
  const { openDetail } = usePrototype();
  if (!table) return null;
  const scadenza = table.column("Scadenza");
  const stato = table.column("Stato");
  const pratica = table.column("Pratica");
  if (scadenza < 0 || stato < 0) return <Card title="Scadenze per stato"><p>Servono le colonne Scadenza e Stato per mostrare il grafico.</p></Card>;
  const dati = table.rows.map((riga, indice) => ((__mk(), { indice, tempo: leggiData(riga[scadenza] || ""), data: riga[scadenza] || "", stato: riga[stato] || "Senza stato", nome: pratica >= 0 ? riga[pratica] || "Pratica senza riferimento" : "Pratica " + (indice + 1) }))).filter((dato) => (__mk(), dato.tempo !== null)).sort((a, b) => (__mk(), a.tempo - b.tempo));
  if (!dati.length) return <Card title="Scadenze per stato"><p>Nessuna scadenza valida da rappresentare. Il grafico si aggiorna con le righe della tabella.</p></Card>;
  const stati = [...new Set(dati.map((dato) => (__mk(), dato.stato)))];
  let cursore = 24;
  const gruppi = stati.map((nome) => {__mk();
    const righe = dati.filter((dato) => (__mk(), dato.stato === nome));
    const inizio = cursore;
    cursore += 36 + righe.length * 34;
    return { nome, righe, inizio };
  });
  const altezza = cursore + 56;
  const primo = dati[0].tempo;
  const ultimoIndice = dati.length - 1;
  const ultimo = dati[ultimoIndice].tempo;
  const margine = Math.max((ultimo - primo) * 0.07, 86400000);
  const minimo = primo - margine;
  const massimo = ultimo + margine;
  const posizione = (tempo) => (__mk(), 240 + ((tempo - minimo) / (massimo - minimo)) * 650);
  const formatta = (tempo) => (__mk(), new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(tempo)));
  const escluse = table.rows.length - dati.length;
  return (
    <Card title="Scadenze per stato">
      <div className="space-y-3 text-(--mk-text)">
        <p className="text-sm text-(--mk-muted)">Asse orizzontale: Scadenza. Gruppi: Stato. Ogni punto rappresenta una riga della tabella; anche le pratiche con la stessa scadenza restano distinte.</p>
        <div className="overflow-auto rounded border border-(--mk-border)" style={{ maxHeight: "32rem" }}>
          <svg role="img" aria-label="Grafico temporale delle scadenze, con pratiche raggruppate per stato" viewBox={"0 0 940 " + altezza} style={{ width: "100%", minWidth: "850px", height: altezza }}>
            <title>Scadenze delle pratiche per stato</title>
            {[0, 0.25, 0.5, 0.75, 1].map((quota) => {__mk();
              if (primo === ultimo && quota !== 0.5) return null;
              const tempo = primo + (ultimo - primo) * quota;
              const x = posizione(tempo);
              return <g key={quota}><line x1={x} x2={x} y1={12} y2={cursore} stroke="var(--mk-divider)" strokeDasharray="3 4" /><text x={x} y={cursore + 28} textAnchor="middle" fill="var(--mk-muted)" fontSize="12">{formatta(tempo)}</text></g>;
            })}
            {gruppi.map((gruppo) => (__mk(), <g key={gruppo.nome}>
              <text x={12} y={gruppo.inizio} fill="var(--mk-text)" fontSize="13" fontWeight="600">{gruppo.nome + " (" + gruppo.righe.length + ")"}</text>
              {gruppo.righe.map((dato, indice) => {__mk();
                const y = gruppo.inizio + 26 + indice * 34;
                const x = posizione(dato.tempo);
                return <g key={dato.indice}>
                  <title>{dato.nome + " · " + dato.data + " · " + dato.stato}</title>
                  <text x={20} y={y + 4} fill="var(--mk-muted)" fontSize="12">{dato.nome}</text>
                  <line x1={240} x2={890} y1={y} y2={y} stroke="var(--mk-divider)" />
                  <circle cx={x} cy={y} r={6} fill="var(--mk-primary)" stroke="var(--mk-surface)" strokeWidth={2} />
                </g>;
              })}
            </g>))}
          </svg>
        </div>
        <p className="text-sm text-(--mk-muted)">{dati.length} pratiche rappresentate su {table.rows.length}.{escluse > 0 ? " Scadenze mancanti o non valide: " + escluse + "." : ""} Aggiornamento automatico dai dati della tabella.</p>
        <details>
          <summary className="cursor-pointer text-sm">Elenco cronologico e dettaglio pratiche</summary>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm text-left"><thead><tr><th className="p-2">Scadenza</th><th className="p-2">Pratica</th><th className="p-2">Stato</th><th className="p-2">Dettaglio</th></tr></thead><tbody>{dati.map((dato) => (__mk(), <tr key={dato.indice} className="border-t border-(--mk-divider)"><td className="p-2">{dato.data}</td><td className="p-2">{dato.nome}</td><td className="p-2">{dato.stato}</td><td className="p-2"><Button variant="link" onClick={() => (__mk(), openDetail(table.id, dato.indice))}>Apri</Button></td></tr>))}</tbody></table>
          </div>
        </details>
      </div>
    </Card>
  );
}
