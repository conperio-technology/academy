import type { ToolKind } from "../types";
import type { OpsLessonData } from "./types.ts";
import { scriptingBasics } from "./linux/scriptingBasics.ts";
import { scriptingRobust } from "./linux/scriptingRobust.ts";
import { textProcessing } from "./linux/textProcessing.ts";
import { systemd } from "./linux/systemd.ts";
import { packages } from "./linux/packages.ts";
import { cron } from "./linux/cron.ts";
import { ssh } from "./linux/ssh.ts";
import { disksLogs } from "./linux/disksLogs.ts";
import { processesServices } from "./windows/processesServices.ts";
import { eventLogs } from "./windows/eventLogs.ts";
import { ntfs } from "./windows/ntfs.ts";
import { psPipeline } from "./windows/psPipeline.ts";
import { psCmdlets } from "./windows/psCmdlets.ts";
import { psScripting } from "./windows/psScripting.ts";
import { adBasics } from "./windows/adBasics.ts";
import { adGpoKerberos } from "./windows/adGpoKerberos.ts";
import { bashVsPowerShell } from "./windows/bashVsPowerShell.ts";
import { cloudBasics } from "./cloud/basics.ts";
import { containerImages } from "./cloud/containerImages.ts";
import { kubernetes } from "./cloud/kubernetes.ts";
import { cicd } from "./cloud/cicd.ts";
import { iac } from "./cloud/iac.ts";
import { observability } from "./cloud/observability.ts";
import { gitTeam } from "./cloud/gitTeam.ts";
import { dbIntro } from "./databases/intro.ts";
import { dbSubqueriesCtes } from "./databases/subqueriesCtes.ts";
import { dbNullsCaseSets } from "./databases/nullsCaseSets.ts";
import { dbWindowFunctions } from "./databases/windowFunctions.ts";
import { dbIsolation } from "./databases/isolation.ts";
import { sqlPracticeAggregation, sqlPracticeJoins, sqlPracticeWindows } from "./databases/practice.ts";
import { dbStorage } from "./databases/storage.ts";
import { dbOrms } from "./databases/orms.ts";
import { dbNosqlFamilies } from "./databases/nosqlFamilies.ts";
import { dbNosqlModeling } from "./databases/nosqlModeling.ts";
import { secCrypto } from "./security/crypto.ts";
import { secWebIdentity } from "./security/webIdentity.ts";
import { sdConsensus } from "./systemDesign/consensus.ts";
import { backupsDr } from "./cloud/backupsDr.ts";
import { cloudNetworkingIam } from "./cloud/networkingIam.ts";
import { virtualization } from "./fundamentals/virtualization.ts";
import { bootProcess } from "./fundamentals/boot.ts";
import { itsm } from "./professional/itsm.ts";
import { emailAuth } from "./networking/email.ts";
import { ipv6 } from "./networking/ipv6.ts";

// Which data file each IT operations lesson renders (components/tools/OpsLesson.tsx).
export const OPS_LESSONS: Partial<Record<ToolKind, OpsLessonData>> = {
  linuxScriptingBasics: scriptingBasics,
  linuxScriptingRobust: scriptingRobust,
  linuxTextProcessing: textProcessing,
  linuxSystemd: systemd,
  linuxPackages: packages,
  linuxCron: cron,
  linuxSsh: ssh,
  linuxDisksLogs: disksLogs,
  winProcessesServices: processesServices,
  winEventLogs: eventLogs,
  winNtfsPermissions: ntfs,
  psObjectsPipeline: psPipeline,
  psCmdletsHelp: psCmdlets,
  psScriptingRemoting: psScripting,
  adDomainsOus: adBasics,
  adGpoKerberos: adGpoKerberos,
  bashVsPowerShell: bashVsPowerShell,
  cloudBasics: cloudBasics,
  cloudContainerImages: containerImages,
  cloudKubernetes: kubernetes,
  cloudCicd: cicd,
  cloudIac: iac,
  cloudObservability: observability,
  gitTeamWorkflows: gitTeam,
  dbIntro: dbIntro,
  dbSubqueriesCtes: dbSubqueriesCtes,
  dbNullsCaseSets: dbNullsCaseSets,
  dbWindowFunctions: dbWindowFunctions,
  dbIsolationAnomalies: dbIsolation,
  sqlPracticeJoins: sqlPracticeJoins,
  sqlPracticeAggregation: sqlPracticeAggregation,
  sqlPracticeWindows: sqlPracticeWindows,
  dbStorageEngines: dbStorage,
  dbOrmsConnectionPools: dbOrms,
  dbNosqlFamilies: dbNosqlFamilies,
  dbNosqlModeling: dbNosqlModeling,
  secCryptoFundamentals: secCrypto,
  secWebSessionsIdentity: secWebIdentity,
  sdConsensusClocks: sdConsensus,
  cloudBackupsDr: backupsDr,
  cloudNetworkingIam: cloudNetworkingIam,
  virtualizationVms: virtualization,
  bootProcess: bootProcess,
  itsmIncidentsChanges: itsm,
  netEmailAuth: emailAuth,
  netIpv6: ipv6,
};
