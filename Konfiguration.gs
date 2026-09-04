/**
 * Local configuration for Google-Scoutnet-synk.
 *
 * IMPORTANT: API keys must NOT be committed to source control. Configure
 * SCOUTNET_API_KEY_LIST_ALL and SCOUTNET_API_KEY_MAILINGLISTS as Apps Script
 * Script Properties instead.
 */

function checkKonfigIsOk() {
  ScoutnetSynkLib.checkDataFromKonfig(KONFIG_OBJECT);
}

const KONFIG_OBJECT = {};

// Google Workspace domain, without https:// or www.
KONFIG_OBJECT.DOMAIN = "";

// Scoutnet organisation/group ID. This is not a secret.
KONFIG_OBJECT.SCOUTNET_GROUP_ID = "";

// Secrets are loaded from Apps Script Script Properties.
KONFIG_OBJECT.API_KEY_LIST_ALL = PropertiesService.getScriptProperties().getProperty("SCOUTNET_API_KEY_LIST_ALL") || "";
KONFIG_OBJECT.API_KEY_MAILINGLISTS = PropertiesService.getScriptProperties().getProperty("SCOUTNET_API_KEY_MAILINGLISTS") || "";

// Optional address/list IDs for spam moderation notifications.
KONFIG_OBJECT.MODERATE_CONTENT_EMAIL = "";

// Addresses that should never be added to synchronized groups.
KONFIG_OBJECT.EXCLUDE_EMAILS = [];

KONFIG_OBJECT.SYNC_USER_CONTACT_INFO = false;
KONFIG_OBJECT.SYNC_USER_AVATAR = true;
KONFIG_OBJECT.SHARE_STATISTICS_OF_RUNNING_SCRIPTS_AND_GROUP_INFORMATION = false;

KONFIG_OBJECT.DEFAULT_USER_AVATAR_URL = "https://web.cdn.scouterna.net/uploads/sites/57/2021/05/avatar.png";

KONFIG_OBJECT.DEFAULT_ORG_UNIT_PATH = "/Scoutnet";
KONFIG_OBJECT.SUSPENDED_ORG_UNIT_PATH = KONFIG_OBJECT.DEFAULT_ORG_UNIT_PATH + "/Avstängda";
KONFIG_OBJECT.ORGANISATION_TYPE = "group";
KONFIG_OBJECT.SCOUTNET_URL = "www.scoutnet.se";

/**
 * Configure which Scoutnet mailing lists create Google Workspace accounts.
 * Put the most specific lists first because the first matching entry wins
 * for the OU assignment.
 */
KONFIG_OBJECT.USER_ACCOUNT_CONFIG = [];

// Contact-group functionality is legacy and disabled by default in the
// modernized deployment. Keep the settings below only if that feature is
// deliberately re-enabled and its authentication model is replaced.
KONFIG_OBJECT.GROUP_NAME = "";
KONFIG_OBJECT.MAX_NUMBER_OF_CONTACTS_FORCE_UPDATE = 0;
KONFIG_OBJECT.STORE_CONTACTS_RELATIVES_FOR_ADULTS = false;
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_CREDENTIALS_SUBJECT = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_CREDENTIALS_SENDER_NAME = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_CREDENTIALS_SENDER_FROM = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_CREDENTIALS_PLAINBODY = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_CREDENTIALS_HTMLBODY = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_SUBJECT = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_TO = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_SENDER_NAME = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_SENDER_FROM = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_PLAINBODY = "";
KONFIG_OBJECT.CONTACT_GROUPS_EMAIL_PARTIAL_MEMBER_MATCH_HTMLBODY = "";
KONFIG_OBJECT.NOTE_KEYS_TO_REPLACE = [];
