# Verkefni 4

Verkefni 4 snýst um að útfæra vefþjónustu fyrir verkefnalista.

Verkefnið er tvíþætt, að útfæra virkni fyrir vefþjónustlista og að útbúa vefþjónustuskil ofan á þá virkni.

## Virkni

Útfæra skal virkni í `todos.js`, öll föll skjal skjala með [`jsdoc`](https://github.com/vefforritun/vef2-2019/blob/master/fyrirlestrar/02/02.1.modules.md#skj%C3%B6lun-eininga).

Virkni skal leyfa að:

* Sækja öll verkefni með `id, title, position, due, created, updated, completed`
  * Mögulegt skal vera að senda inn röðunargildi sem stýrir því hvort lista sé raðað eftir `position` í hækkandi (ascending) eða lækkandi röð (descending)
  * Mögulegt skal vera að senda inn að aðeins eigi að sýna verkefni sem er lokið (`completed = true`)
* Sækja stakt verkefni eftir `id` með `id, title, position, due, created, updated, completed`
* Útbúa verkefni með titli, loka dagsetningu og staðsetningu
  * Verkefni sem er búið til nýtt er alltaf með `completed = false` sem setja má með sjálfgefnu gildi í gagnagrunn
  * Sjá að neðan um staðfestingu gagna
* Uppfæra verkefni eftir `id` með titli, loka dagsetningu, staðsetningu og hvort verkefni sé lokið eða ekki
* Eyða verkefni eftir `id`

### Staðfesting gagna

* Titill (`title`) skal alltaf senda með og verður hann að vera `[1, 128]` stafir
  * Ef titill er ekki gildur skal senda villuskilaboðin `Titill verður að vera strengur sem er 1 til 128 stafir`
* Loka dagsetning (`due`) má vera tóm (`null`), en ef hún er það ekki, verður hún að vera [ISO 8601 dagsetning](https://en.wikipedia.org/wiki/ISO_8601)
  * Ef loka dagsetning er ekki gild skal senda villuskilaboðin `Dagsetning verður að vera gild ISO 8601 dagsetning`
* Staðsetning (`position`) má vera tóm (`null`), en ef hún er það ekki, verður hún að vera tala, 0 eða stærri
  * Ef staðsetning er ekki gild skal senda villuskilaboðin `Staðsetning verður að vera heiltala stærri eða jöfn 0`
* Hvort verkefni sé lokið (`completed`) verður að vera boolean gildi ef það er sent inn
  * Ef hvort verkefni sé lokið er ekki gilt skal senda villuskilaboðin `Lokið verður að vera boolean gildi`

## Vefþjónusta

* `GET` á `\` skal skila fylki af öllum verkefnum
  * Ef query-string breyta `order=desc` er send með skal raða verkefnum eftir `position` í lækkandi röð, annars í hækkandi r-ð (ascending). T.d. `/?order=desc`
  * Ef query-string breyta `completed=true` er send skal aðeins birta verkefni sem er lokið, ef `completed=false` skal aðeins birta verkefni sem er ekki lokið. T.d. `/?completed=true`
  * Mögulegt á að vera að blanda saman þessum gildum, t.d. `/?completed=true&order=desc`
* `POST` á `\` skal útbúa nýtt verkefni
  * Ef það er ólöglegt skal öllum villum skilað í fylki með skilaboðum að ofan og hvaða reitur var ólöglegur
  * Ef löglegt er verkefni skilað
* `GET` á `\:id` skal skila hlut sem inniheldur verkefni með viðeigandi id
  * Ef verkefni er til er því skilað sem hlut
  * Ef verkefni er ekki til skal skila að verkefni sé ekki til
* `PATCH` á `\:id` skal uppfæra verkefni með viðeigandi `id`
  * Ekki þarf að senda öll gögn—aðeins þau sem á að uppfæra
  * Sömu reglur gilda um gögn og þegar nýtt verkefni er búið til
  * Ef færsla er ekki til skal skila að verkefni sé ekki til
* `DELETE` á `\:id`, eyðir verkefni með viðeigandi `id`
  * Ef verkefni er eytt skal engu skilað, upplýsingar um niðurstöðu skal gefa til kynna með HTTP status kóða
  * Ef verkefni er ekki til skal skila að verkefni sé ekki til

Velja skal viðeigandi HTTP status kóða fyrir hvert tilvik um sig.

### Dæmi um verkefni

```json
{
  "id": 1,
  "title": "Skrá í vefforritun 2",
  "position": 1,
  "due": null,
  "created": "2019-02-20T21:36:19.659Z",
  "updated": "2019-02-20T21:36:19.659Z",
  "completed": true
}
```

### Dæmi um villu

```json
[
  {
    "field": "title",
    "message": "Titill verður að vera strengur sem er 1 til 128 stafir"
  }
]
```

### Dæmi ef verkefni finnst ekki

```json
{
  "error": "Item not found"
}
```

## Gagnagrunnur

Geyma skal gögn í postgres gagnagrunni með eftirtalda dálka:

* `id`, tölulegt auðkenni
* `title`, strengur að hámarki 128 stafir, ekki tómur
* `due`, timestamp með tímabelti, má vera tómt
* `position`, heiltala, sjálfgefið 0
* `completed`, boolean gildi, sjálfgefið `false`
* `created`, timestamp með tímabelti, sjálfgefið _núna_
* `updated`, timestamp með tímabelti, sjálfgefið _núna_

### Prufugögn

Þegar `npm run setup` er keyrt skal setja upp gagnagrunn (g.r.f. að `DATABASE_URL` sé sett) með eftirtöldum prufugögnum:

Titill | Staðsetning | Lokið | Ljúka fyrir
-------|-------------|-------|---------
Skrá í vefforritun 2 | 1 | true | null
Sækja verkefni 4 á github | 2 | false | null
Klára verkefni 4 | 3 | false | null
Setja verkefni 4 upp á Heroku | 4 | false | null
Skila verkefni 4 | 5 | false | 2019-03-08 23:59:59

## Heroku

Verkefnið skal keyra á Heroku með allri þeirri virkni sem hér er lýst ásamt prufugögnum.

## Annað

Engu ætti að þurfa að breyta í `app.js`.

Öll gögn skulu vera á json formi, bæði sem send eru inn í vefþjónustu og þær sem vefþjónusta skilar.

Passa þarf upp á SQL injection og XSS í gögnum sem koma frá notanda.

Öll dependency skulu skráð í `package.json`.

`npm start` skal keyra upp vefþjón á localhost porti 3000.

## Git og GitHub

Verkefni þetta er sett fyrir á GitHub og almennt ætti að skila því úr einka (private) repo nemanda. Nemendur geta fengið gjaldfrjálsan aðgang að einkarepos á meðan námi stendur, sjá https://education.github.com/.

Til að byrja er hægt að afrita þetta repo og bæta við á sínu eigin:

```bash
> git clone https://github.com/vefforritun/vef2-2019-v4.git
> cd vef2-2019-v4
> git remote remove origin # fjarlægja remote sem verkefni er í
> git remote add origin <slóð á repo> # bæta við í þínu repo
> git push -u origin master # ýta á nýtt origin og tracka branch
```

## Mat

* 10% – Snyrtilegur kóði, engar villur þegar `npm test` er keyrt
* 20% – Verkefni sett upp á Heroku
* 30% - Vefþjónustuskil
* 40% – Virkni verkefnalista

## Sett fyrir

Verkefni sett fyrir í fyrirlestri fimmtudaginn 21. febrúar 2019.

## Skil

Skila skal undir „Verkefni og hlutaprófa“ á Uglu í seinasta lagi fyrir lok dags föstudaginn 8. mars 2019.

Skilaboð skulu innihalda:

* Slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo (sjá leiðbeiningar). Notendanöfn þeirra eru `freyrdanielsson`, `gunkol`, `kth130`
* Slóð á verkefni keyrandi á Heroku

## Einkunn

Sett verða fyrir sex minni verkefni þar sem fimm bestu gilda 6% hvert, samtals 30% af lokaeinkunn.

Sett verða fyrir tvö hópverkefni þar sem hvort um sig gildir 15%, samtals 30% af lokaeinkunn.

Verkefnahluti gildir 60% og lokapróf gildir 40%. Ná verður *bæði* verkefnahluta og lokaprófi með lágmarkseinkunn 5.

---

> Útgáfa 0.2

| Útgáfa | Lýsing                                    |
|--------|-------------------------------------------|
| 0.1    | Fyrsta útgáfa                             |
| 0.2    | Bæta við um query-string fyrir GET /, lagfæra lýsingu á því sem senda þarf inn |
