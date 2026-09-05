/** Modernization and safety helpers for Google-Scoutnet-synk. */

function getConfigProperty_(name, fallback) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  return value === null || value === '' ? fallback : value;
}

function validateScoutnetSyncInput_(members) {
  if (!Array.isArray(members)) {
    throw new Error('Scoutnet returned no valid member array. Synchronization aborted.');
  }
  const minimumExpected = Number(getConfigProperty_('MIN_EXPECTED_MEMBERS', '1'));
  if (!Number.isFinite(minimumExpected) || minimumExpected < 1) {
    throw new Error('MIN_EXPECTED_MEMBERS must be a positive number.');
  }
  if (members.length < minimumExpected) {
    throw new Error('Scoutnet returned ' + members.length + ' members, below MIN_EXPECTED_MEMBERS=' + minimumExpected + '. Synchronization aborted to protect Google Workspace.');
  }
}

/** Run a read-only Scoutnet preflight. */
function kontrolleraScoutnetSynkronisering() {
  const members = fetchScoutnetMembers_(true, false);
  validateScoutnetSyncInput_(members);
  console.info('Scoutnet preflight OK. Members available: %s', members.length);
  return members.length;
}

/** Combined entry point with the modernized user engine and a fail-closed Scoutnet preflight. */
function synkroniseraAnvandareOchGrupperSakert() {
  const members = fetchScoutnetMembers_(true, false);
  validateScoutnetSyncInput_(members);
  console.info('Scoutnet preflight OK: %s members.', members.length);
  synkroniseraAnvandareModerniserad_(KONFIG_OBJECT);
  synkroniseraGrupperAllaRader();
}
