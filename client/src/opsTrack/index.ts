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
};
