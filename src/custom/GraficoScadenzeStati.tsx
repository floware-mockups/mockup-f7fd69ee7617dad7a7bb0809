// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("GraficoScadenzeStati");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("GraficoScadenzeStati");
import { Card, useTable } from "../floware";

function leggiData(testo) {__mk();
  const valore = testo.trim();
  const italiana = valore.includes("/");
  const parti = italiana ? valore.split("/") : valore.split("-");
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
  if (!table) return null;
  const scadenza = table.column("Scadenza");
  const stato = table.column("Stato");
  const pratica = table.column("Pratica");
  if (scadenza < 0 || stato < 0) return <Card title="Scadenze per stato"><p>Servono le colonne Scadenza e Stato per mostrare il grafico.</p></Card>;
  const dati = table.rows.map((riga, indice) => ((__mk(), { indice, tempo: leggiData(riga[scadenza] || ""), data: riga[scadenza] || "", stato: riga[stato] || "Senza stato", nome: pratica >= 0 ? riga[pratica] : "Pratica " + (indice + 1) }))).filter((dato) => (__mk(), dato.tempo !== null)).sort((a, b) => (__mk(), a.tempo - b.tempo));
  if (!dati.length) return <Card title="Scadenze per stato"><p>Nessuna scadenza valida da rappresentare.</p></Card>;
  const stati = [...new Set(dati.map((dato) => (__mk(), dato.stato)))];
  const ultimoIndice = dati.length - 1;
  const primo = dati[0].tempo;
  const ultimo = dati[ultimoIndice].tempo;
  const margine = Math.max((ultimo - primo) * 0.07, 86400000);
  const minimo = primo - margine;
  const massimo = ultimo + margine;
  const altezza = stati.length * 78 + 95;
  const formatta = (tempo) => (__mk(), new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(tempo)));
  const posizione = (tempo) => (__mk(), 235 + ((tempo - minimo) / (massimo - minimo)) * 680);
  const escluse = table.rows.length - dati.length;
  return (
    <Card title="Scadenze per stato">
      <div className="space-y-3 text-(--mk-text)">
        <p className="text-sm text-(--mk-muted)">Ogni punto è una pratica. Le scadenze avanzano da sinistra a destra; ogni corsia distingue uno stato. Le etichette indicano le pratiche.</p>
        <div className="overflow-x-auto rounded border border-(--mk-border)">
          <svg role="img" aria-label="Scadenze delle pratiche nel tempo, suddivise per stato" viewBox={"0 0 950 " + altezza} style={{ width: "100%", minWidth: "850px", height: altezza }}>
            <title>Scadenze per stato delle pratiche</title>
            {[0, 0.25, 0.5, 0.75, 1].map((quota) => {__mk();
              const tempo = primo + (ultimo - primo) * quota;
              if (primo === ultimo && quota !== 0.5) return null;
              const x = posizione(tempo);
              return <g key={quota}><line x1={x} x2={x} y1={25} y2={altezza - 48} stroke="var(--mk-divider)" strokeDasharray="3 4" /><text x={x} y={altezza - 22} textAnchor="middle" fill="var(--mk-muted)" fontSize="12">{formatta(tempo)}</text></g>;
            })}
            {stati.map((nome, indice) => {__mk();
              const y = 48 + indice * 78;
              return <g key={nome}><text x={12} y={y + 4} fill="var(--mk-text)" fontSize="12">{nome}</text><line x1={235} x2={915} y1={y} y2={y} stroke="var(--mk-border)" /></g>;
            })}
            {dati.map((dato) => {__mk();
              const x = posizione(dato.tempo);
              const y = 48 + stati.indexOf(dato.stato) * 78;
              return <g key={dato.indice}><title>{dato.nome + " · " + dato.data + " · " + dato.stato}</title><circle cx={x} cy={y} r={6} fill="var(--mk-primary)" stroke="var(--mk-surface)" strokeWidth={2} /><text x={x} y={y - 14} textAnchor="middle" fill="var(--mk-text)" fontSize="11">{dato.nome}</text></g>;
            })}
          </svg>
        </div>
        <p className="text-sm text-(--mk-muted)">{dati.length} pratiche rappresentate.{escluse > 0 ? " Scadenze mancanti o non valide: " + escluse + "." : ""}</p>
        <details>
          <summary className="cursor-pointer text-sm">Date e pratiche in ordine cronologico</summary>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm text-left"><thead><tr><th className="p-2">Scadenza</th><th className="p-2">Pratica</th><th className="p-2">Stato</th></tr></thead><tbody>{dati.map((dato) => (__mk(), <tr key={dato.indice} className="border-t border-(--mk-divider)"><td className="p-2">{dato.data}</td><td className="p-2">{dato.nome}</td><td className="p-2">{dato.stato}</td></tr>))}</tbody></table>
          </div>
        </details>
      </div>
    </Card>
  );
}
