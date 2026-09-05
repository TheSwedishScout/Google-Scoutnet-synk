/**
 * Moderniserad användarsynk för Google-Scoutnet-synk (2026).
 *
 * Denna fil ersätter den destruktiva delen av den äldre användarsynken
 * utan att behöva ändra övriga Scoutnet-funktioner.
 *
 * Viktiga egenskaper:
 * - läser alla användare under Scoutnets OU-träd, inte bara rot-OU:n
 * - matchar användare via Scoutnets member_no/externalId
 * - använder Map/Set för lookup
 * - fail-closed vid misstänkt Scoutnet-data
 * - har ett tak för automatiska avstängningar
 * - skapar nya konton med changePasswordAtNextLogin
 */

function synkroniseraAnvandareModerniserad_(inputConfig) {
  KONFIG = inputConfig;

  let allMembers = [];
  if (KONFIG.ORGANISATION_TYPE === "group") {
    allMembers = fetchScoutnetMembers_(true, false);
    validateScoutnetSyncInput_(allMembers);
  }

  const googleUsers = getAllScoutnetGoogleAccounts_();
  const usersByMemberNo = new Map();
  googleUsers.forEach(function(user) {
    (user.externalIds || []).forEach(function(externalId) {
      if (externalId.type === "organization" && externalId.value) {
        usersByMemberNo.set(String(externalId.value), user);
      }
    });
  });

  const membersByMemberNo = new Map();
  allMembers.forEach(function(member) {
    if (member.member_no) membersByMemberNo.set(String(member.member_no), member);
  });

  const processedMemberNos = new Set();
  const activeMemberNos = new Set();
  const defaultAvatar = getByteArrayOfDefaultImage_();
  const defaultAvatarId = getAvatarId_(defaultAvatar);

  for (let p = 0; p < KONFIG.USER_ACCOUNT_CONFIG.length; p++) {
    const config = KONFIG.USER_ACCOUNT_CONFIG[p];
    let orgUnitPath = KONFIG.DEFAULT_ORG_UNIT_PATH;
    if (config.orgUnitPath) orgUnitPath += "/" + config.orgUnitPath;
    createSuborganisationIfNeeded_(orgUnitPath);

    let listMembers;
    if (config.scoutnetListId) {
      listMembers = fetchScoutnetMembersMultipleMailinglists_(config.scoutnetListId, "", "", true);
    } else if (KONFIG.ORGANISATION_TYPE === "group") {
      listMembers = getScoutleaders_(allMembers);
    } else {
      listMembers = [];
    }

    if (!Array.isArray(listMembers)) {
      throw new Error("Scoutnet-listan för " + orgUnitPath + " gav ogiltiga data. Synk avbruten.");
    }

    listMembers.forEach(function(listMember) {
      const memberNo = String(listMember.member_no || "");
      if (!memberNo || processedMemberNos.has(memberNo)) return;
      processedMemberNos.add(memberNo);
      activeMemberNos.add(memberNo);

      const member = KONFIG.ORGANISATION_TYPE === "group"
        ? membersByMemberNo.get(memberNo)
        : listMember;

      if (!member) {
        throw new Error("Medlem " + memberNo + " finns i en Scoutnet-lista men saknas i medlemslistan. Synk avbruten.");
      }

      const existingUser = usersByMemberNo.get(memberNo);
      if (existingUser) {
        updateAccount_(member, existingUser, orgUnitPath, defaultAvatar, defaultAvatarId);
      } else {
        const created = createAccountModerniserad_(member, orgUnitPath);
        console.info("Skapade Google-konto %s för Scoutnet-medlem %s", created.primaryEmail, memberNo);
      }
    });
  }

  const accountsToSuspend = googleUsers.filter(function(user) {
    const memberNo = getOrganizationExternalId_(user);
    return memberNo && !activeMemberNos.has(memberNo);
  });

  // Konton utan Scoutnet externalId lämnas orörda. De kan vara manuellt skapade.
  console.info("Scoutnet-konton som skulle avstängas: %s", accountsToSuspend.length);

  const maxSuspensions = getMaxSuspensionsPerRun_();
  if (accountsToSuspend.length > maxSuspensions) {
    throw new Error(
      "Synk avbruten: " + accountsToSuspend.length +
      " konton skulle avstängas, över gränsen MAX_SUSPENSIONS_PER_RUN=" + maxSuspensions + "."
    );
  }

  accountsToSuspend.forEach(function(user) {
    suspendAccount_(user);
  });
}

/** Hämtar alla användare i Scoutnets OU-träd genom att först lista OUs. */
function getAllScoutnetGoogleAccounts_() {
  const users = [];
  const seen = new Set();
  const orgUnits = getAllOrgUnitsUnderPath_(KONFIG.DEFAULT_ORG_UNIT_PATH);

  orgUnits.forEach(function(orgUnitPath) {
    let pageToken;
    do {
      const page = AdminDirectory.Users.list({
        domain: KONFIG.DOMAIN,
        query: "orgUnitPath='" + orgUnitPath.replace(/'/g, "\\'") + "'",
        orderBy: "givenName",
        maxResults: 150,
        pageToken: pageToken
      });
      (page.users || []).forEach(function(user) {
        if (!seen.has(user.id)) {
          seen.add(user.id);
          users.push(user);
        }
      });
      pageToken = page.nextPageToken;
    } while (pageToken);
  });

  return users;
}

function getAllOrgUnitsUnderPath_(rootPath) {
  const result = new Set([rootPath]);
  let pageToken;
  do {
    const page = AdminDirectory.Orgunits.list("my_customer", {
      type: "all",
      pageToken: pageToken
    });
    (page.organizationUnits || []).forEach(function(orgUnit) {
      const path = orgUnit.orgUnitPath || "";
      if (path === rootPath || path.indexOf(rootPath + "/") === 0) {
        result.add(path);
      }
    });
    pageToken = page.nextPageToken;
  } while (pageToken);
  return Array.from(result);
}

function getOrganizationExternalId_(user) {
  const externalIds = user && user.externalIds ? user.externalIds : [];
  for (let i = 0; i < externalIds.length; i++) {
    if (externalIds[i].type === "organization" && externalIds[i].value) {
      return String(externalIds[i].value);
    }
  }
  return "";
}

function createAccountModerniserad_(member, orgUnitPath) {
  const firstName = String(member.first_name || "").trim();
  const lastName = String(member.last_name || "").trim();
  const firstPart = makeNameReadyForEmailAdress_(firstName);
  const lastPart = makeNameReadyForEmailAdress_(lastName);

  if (!firstPart || !lastPart) {
    throw new Error("Kan inte skapa e-postadress för Scoutnet-medlem " + member.member_no + ": namn saknas eller är ogiltigt.");
  }

  const baseEmail = firstPart + "." + lastPart;
  let email = baseEmail + "@" + KONFIG.DOMAIN;

  if (checkIfEmailExists_(email)) {
    let found = false;
    for (let suffix = 1; suffix <= 99; suffix++) {
      const candidate = baseEmail + suffix + "@" + KONFIG.DOMAIN;
      if (!checkIfEmailExists_(candidate)) {
        email = candidate;
        found = true;
        break;
      }
    }
    if (!found) throw new Error("Ingen ledig e-postadress hittades för " + firstName + " " + lastName + ".");
  }

  const user = {
    primaryEmail: email,
    name: { givenName: firstName, familyName: lastName },
    externalIds: [{ type: "organization", value: String(member.member_no) }],
    orgUnitPath: orgUnitPath,
    password: generateTemporaryPassword_(),
    changePasswordAtNextLogin: true
  };

  if (member.email) user.recoveryEmail = member.email;
  return AdminDirectory.Users.insert(user);
}
