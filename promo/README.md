# Pubblicità d'apertura (app-open ad)

L'app, appena si apre, mostra per pochi secondi una pubblicità a schermo intero
presa **solo** da questo repo GitHub — nessuna rete pubblicitaria, nessun server
esterno, nessun tracciamento. Puoi cambiarla quando vuoi **senza ricompilare**
né pubblicare un aggiornamento: modifichi un file e basta.

## Come cambiare la pubblicità

Modifica [`promo.json`](../promo.json) nella radice del repo (matita ✏️ su GitHub):

```json
{
  "enabled": true,          // false = nessuna pubblicità, l'app parte subito
  "seconds": 5,             // durata in secondi (consigliato 5, max 15)
  "rotate": [               // se metti più voci, ne mostra una a caso a ogni apertura
    { "image": "URL immagine", "link": "https://la-tua-pagina.com" }
  ]
}
```

- **image**: link diretto a un'immagine PNG/JPG. Puoi caricare le immagini in questa
  cartella `promo/` e usare l'URL `https://raw.githubusercontent.com/blackstardigitalstudio/blackstar-mobile/main/promo/NOMEFILE.png`.
- **link**: la pagina che si apre quando l'utente **tocca** la pubblicità (opzionale).
- La modifica è live per tutti in pochi minuti (cache CDN di GitHub).

## Formato consigliato per le immagini

- Verticale **1080 × 1920** (9:16), sfondo scuro per fondersi con l'app.
- Le immagini attuali (`cuentas-clara.png`, `teknosteps.png`) sono già così: usale
  come modello.

## Domani: rete a pagamento (Adsterra / Monetag)

Il sistema è già predisposto per passare in futuro a una rete pubblicitaria che
paga, sempre cambiando solo questo file. Basta chiedere.

Made in Italy 🇮🇹
