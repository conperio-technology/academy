import type { ComponentType } from "react";
import type { OpsWidgetName } from "../../../opsTrack/types";
import { AvailabilityZones, CicdPipeline, GitTeamFlow, IacPlan, ImageTags, K8sSelectors, Observability, SharedResponsibility } from "./CloudWidgets";
import { AdExplorer, BashVsPs, EventLog, ExecutionPolicy, GpoPrecedence, NtfsAccess, PsPipeline, PsVerbNoun, WinServices } from "./WindowsWidgets";
import { AptSimulator, CronExplainer, DiskFull, SshLogin, StrictMode, SystemdService, TextToolbox, WordSplitting } from "./LinuxWidgets";

// The simulators an IT operations lesson can embed by name (see opsTrack/types.ts).
export const OPS_WIDGETS: Record<OpsWidgetName, ComponentType> = {
  wordSplitting: WordSplitting,
  strictMode: StrictMode,
  textToolbox: TextToolbox,
  systemdService: SystemdService,
  aptSimulator: AptSimulator,
  cronExplainer: CronExplainer,
  sshLogin: SshLogin,
  diskFull: DiskFull,
  winServices: WinServices,
  eventLog: EventLog,
  ntfsAccess: NtfsAccess,
  psPipeline: PsPipeline,
  psVerbNoun: PsVerbNoun,
  executionPolicy: ExecutionPolicy,
  adExplorer: AdExplorer,
  gpoPrecedence: GpoPrecedence,
  bashVsPs: BashVsPs,
  sharedResponsibility: SharedResponsibility,
  availabilityZones: AvailabilityZones,
  imageTags: ImageTags,
  k8sSelectors: K8sSelectors,
  cicdPipeline: CicdPipeline,
  iacPlan: IacPlan,
  observability: Observability,
  gitTeamFlow: GitTeamFlow,
};
