/**
 * @author Emil Öhman <emil.ohman@scouterna.se>
 * @website https://github.com/Scouterna
 * @version 2026-09-04
 */

/**
 * Anropa denna funktion om du vill synkronisera både användare och
 * grupper direkt efter varandra. The modernized entry point performs a
 * fail-closed Scoutnet preflight before any Google writes are made.
 */
function synkroniseraAnvandareOchGrupper() {
  synkroniseraAnvandareOchGrupperSakert();
}

/***Grupper***/
function synkroniseraGrupperVissaRader1() {
  synkroniseraGrupper_(0, 10);
}

function synkroniseraGrupperVissaRader2() {
  synkroniseraGrupper_(11, 20);
}

function synkroniseraGrupperVissaRader3() {
  synkroniseraGrupper_(21, 30);
}

function synkroniseraGrupperVissaRaderOchEtikett1() {
  synkroniseraGrupper_(0, 10, "Avdelningar");
}

function synkroniseraGrupperVissEtikett1() {
  synkroniseraGrupper_("Avdelningar");
}
/***Grupper - Slut***/

/***Medlemslistor***/
function synkroniseraMedlemslistorVissaRaderUppdateraOchSkicka1() {
  ScoutnetSynkLib.uppdateraMedlemslistor(KONFIG_OBJECT, 1, 1);
  ScoutnetSynkLib.skickaUtTillMedlemslistor(KONFIG_OBJECT, 1, 1);
}

function synkroniseraMedlemslistorVissaRaderUppdateraEnbart1() {
  ScoutnetSynkLib.uppdateraMedlemslistor(KONFIG_OBJECT, 5, 5);
}

function synkroniseraMedlemslistorVissaRaderSkickaEnbart1() {
  ScoutnetSynkLib.skickaUtTillMedlemslistor(KONFIG_OBJECT, 1, 1);
}
