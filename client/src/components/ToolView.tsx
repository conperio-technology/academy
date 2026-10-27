import { lazy, Suspense, useEffect, useState } from "react";
import { fetchTool } from "../api";
import { GlossaryProse } from "./GlossaryProse";
import type { ToolDetail } from "../types";
import { AlgorithmIntro } from "./tools/AlgorithmIntro";
import { BigOChart } from "./tools/BigOChart";
import { BitCalculator } from "./tools/BitCalculator";
import { ContainersK8s } from "./tools/ContainersK8s";
import { CapacityEstimation } from "./tools/CapacityEstimation";
import { CapConsistency } from "./tools/CapConsistency";
import { Caching } from "./tools/Caching";
import { ConsistentHashing } from "./tools/ConsistentHashing";
import { DesignInterview } from "./tools/DesignInterview";
import { LoadBalancing } from "./tools/LoadBalancing";
import { MessageQueues } from "./tools/MessageQueues";
import { RateLimiting } from "./tools/RateLimiting";
import { TailLatency } from "./tools/TailLatency";
import { Resilience } from "./tools/Resilience";
import { Cdn } from "./tools/Cdn";
import { AsyncSystems } from "./tools/AsyncSystems";
import { Observability } from "./tools/Observability";
import { ScaleLab } from "./tools/ScaleLab";
import { ApiRestHttp } from "./tools/ApiRestHttp";
import { ApiStyles } from "./tools/ApiStyles";
import { ApiPagination } from "./tools/ApiPagination";
import { ApiIdempotency } from "./tools/ApiIdempotency";
import { ApiEvolution } from "./tools/ApiEvolution";
import { ApiAuthLimits } from "./tools/ApiAuthLimits";
import { AiAssistedEngineering } from "./tools/AiAssistedEngineering";
import { ReplicationSharding } from "./tools/ReplicationSharding";
import { CommonDesignPatterns } from "./tools/CommonDesignPatterns";
import { DesignPatternCatalog } from "./tools/DesignPatternCatalog";
import { DesignPatternQuiz } from "./tools/DesignPatternQuiz";
import { SolidPrinciples } from "./tools/SolidPrinciples";
import { ComplexityAnalysis } from "./tools/ComplexityAnalysis";
import { ComplexityAmortized } from "./tools/ComplexityAmortized";
import { ComplexityExplaining } from "./tools/ComplexityExplaining";
import { ComplexityGym } from "./tools/ComplexityGym";
import { ComplexitySpace } from "./tools/ComplexitySpace";
import { ComplexityHiddenCosts } from "./tools/ComplexityHiddenCosts";
import { ComplexityVariables } from "./tools/ComplexityVariables";
import { ComplexityRecursion } from "./tools/ComplexityRecursion";
import { ComputerArchitecture } from "./tools/ComputerArchitecture";
import { DigitalAnalogIo } from "./tools/DigitalAnalogIo";
import { DnsHttpTrace } from "./tools/DnsHttpTrace";
import { DynamicArrayGrowth } from "./tools/DynamicArrayGrowth";
import { EndiannessCalculator } from "./tools/EndiannessCalculator";
import { FloatCalculator } from "./tools/FloatCalculator";
import { GitBasics } from "./tools/GitBasics";
import { GitBranching } from "./tools/GitBranching";
import { GlossaryFlashCards, GlossaryList, GlossaryQuiz } from "./tools/Glossary";
import { HashTableSim } from "./tools/HashTableSim";
import { IndustrialNetworking } from "./tools/IndustrialNetworking";
import { InterfacesAbstraction } from "./tools/InterfacesAbstraction";
import { IpSubnetCalculator } from "./tools/IpSubnetCalculator";
import { LadderLogicBasics } from "./tools/LadderLogicBasics";
import { LogicGates } from "./tools/LogicGates";
import { NetworkLayers } from "./tools/NetworkLayers";
import { OopBasics } from "./tools/OopBasics";
import { BehavioralMock, BehavioralStar, StoryBank } from "./tools/Behavioral";
import { MixedSet } from "./tools/MixedSet";
import { PrepPlan } from "./tools/PrepPlan";
import { PatternDrill } from "./tools/PatternDrill";
import { BlockReps } from "./tools/BlockReps";
import { PlcMemoryAddressing } from "./tools/PlcMemoryAddressing";
import { PlcSafetyRedundancy } from "./tools/PlcSafetyRedundancy";
import { PlcScanCycle } from "./tools/PlcScanCycle";
import { ServicesDependencyInjection } from "./tools/ServicesDependencyInjection";
import { SqlAggregation } from "./tools/SqlAggregation";
import { SqlBasics } from "./tools/SqlBasics";
import { AuthnAuthz } from "./tools/AuthnAuthz";
import { HashingEncryption } from "./tools/HashingEncryption";
import { SqlIndexes } from "./tools/SqlIndexes";
import { SqlInjection } from "./tools/SqlInjection";
import { TlsCertificates } from "./tools/TlsCertificates";
import { XssDemo } from "./tools/XssDemo";
import { SqlJoins } from "./tools/SqlJoins";
import { SqlSchemaDesign } from "./tools/SqlSchemaDesign";
import { SqlTransactions } from "./tools/SqlTransactions";
import { TcpVsUdp } from "./tools/TcpVsUdp";
import { ThreadsProcesses } from "./tools/ThreadsProcesses";
import { RaceConditions } from "./tools/RaceConditions";
import { SyncPrimitives } from "./tools/SyncPrimitives";
import { Deadlock } from "./tools/Deadlock";
import { ProducerConsumer } from "./tools/ProducerConsumer";
import { AsyncAwait } from "./tools/AsyncAwait";
import { StackHeapGc } from "./tools/StackHeapGc";
import { MemoryHierarchy } from "./tools/MemoryHierarchy";
import { AiMlBasics } from "./tools/AiMlBasics";
import { AiNeuralNetworks } from "./tools/AiNeuralNetworks";
import { AiTokensEmbeddings } from "./tools/AiTokensEmbeddings";
import { AiTransformers } from "./tools/AiTransformers";
import { AiLlmTraining } from "./tools/AiLlmTraining";
import { AiUsingLlms } from "./tools/AiUsingLlms";
import { AiRisksLimits } from "./tools/AiRisksLimits";
import { CpuScheduling } from "./tools/CpuScheduling";
import { KernelModeSyscalls } from "./tools/KernelModeSyscalls";
import { RunningAProgram } from "./tools/RunningAProgram";
import { CompiledInterpreted } from "./tools/CompiledInterpreted";
import { LinkersLibraries } from "./tools/LinkersLibraries";
import { TextEncoding } from "./tools/TextEncoding";
import { TestPyramid } from "./tools/TestPyramid";
import { TestDoubles } from "./tools/TestDoubles";
import { TddCoverage } from "./tools/TddCoverage";
import { MathForCs } from "./tools/MathForCs";
import { GreedyAlgorithms } from "./tools/GreedyAlgorithms";
import { MathInterview } from "./tools/MathInterview";
import { BitTricks } from "./tools/BitTricks";
import { RangeQueries } from "./tools/RangeQueries";
import { LazyPropagation } from "./tools/LazyPropagation";
import { DataTypes } from "./tools/DataTypes";
import { FunctionsCallStack } from "./tools/FunctionsCallStack";
import { HowTheInternetWorks } from "./tools/HowTheInternetWorks";
import { SubnettingPractice } from "./tools/SubnettingPractice";
import { ArpSwitching } from "./tools/ArpSwitching";
import { Vlans } from "./tools/Vlans";
import { Dhcp } from "./tools/Dhcp";
import { WifiBasics } from "./tools/WifiBasics";
import { RoutingGateways } from "./tools/RoutingGateways";
import { NatPortForwarding } from "./tools/NatPortForwarding";
import { FirewallsPorts } from "./tools/FirewallsPorts";
import { Vpns } from "./tools/Vpns";
import { NetTroubleshooting } from "./tools/NetTroubleshooting";
import { OwaspTop10 } from "./tools/OwaspTop10";
import { AccessControlAttacks } from "./tools/AccessControlAttacks";
import { DeserializationMisconfig } from "./tools/DeserializationMisconfig";
import { SecretsLeastPrivilege } from "./tools/SecretsLeastPrivilege";
import { ThreatModelingStride } from "./tools/ThreatModelingStride";
import { PasswordsMfa } from "./tools/PasswordsMfa";
import { PhishingSocial } from "./tools/PhishingSocial";
import { IncidentResponseLogging } from "./tools/IncidentResponseLogging";
import { OtIcsSecurity } from "./tools/OtIcsSecurity";
import { LangLesson } from "./tools/LangLesson";
import { LangCheatSheet } from "./tools/LangCheatSheet";
import { LANG_LESSONS } from "../langTrack";
import { OpsLesson } from "./tools/OpsLesson";
import { OPS_LESSONS } from "../opsTrack";
import { PlcLesson } from "./tools/PlcLesson";
import { PlcExercise } from "./tools/PlcExercise";
import { PLC_LESSON_BY_ID } from "../plc/lessons";
import { PLC_EXERCISE_BY_ID } from "../plc/exercises";
import { Micro850Lab } from "./tools/Micro850Lab";
import { MICRO850_LAB_BY_ID } from "../plc/micro850Labs";

// The Linux lab pulls in an x86 emulator and a terminal, so it loads only when opened.
const LinuxLab = lazy(() => import("./tools/LinuxLab"));

const LINUX_LESSON: Partial<Record<ToolDetail["toolKind"], "files" | "permissions" | "pipes" | "processes">> = {
  linuxFiles: "files",
  linuxPermissions: "permissions",
  linuxPipes: "pipes",
  linuxProcesses: "processes",
};

interface Props {
  toolId: string;
}

// Sibling to LessonView, for the other lesson kind: a reference explanation + an
// interactive calculator instead of a visualizer + code editor. No completion tracking
// here -- see content/ITool.cs for why tools don't have a pass/fail concept.
export function ToolView({ toolId }: Props) {
  const [tool, setTool] = useState<ToolDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTool(toolId)
      .then(setTool)
      .finally(() => setLoading(false));
  }, [toolId]);

  if (loading) return <p className="status-text">Loading…</p>;
  if (!tool) return <p className="status-text">Couldn't load this tool.</p>;

  return (
    <div className="lesson-view">
      <header>
        <h1>{tool.title}</h1>
        <p className="one-liner">{tool.oneLiner}</p>
      </header>

      <div className="key-takeaway">
        <span className="key-takeaway-label">Key takeaway</span>
        <p>{tool.keyTakeaway}</p>
      </div>

      <GlossaryProse text={tool.explanation} title={tool.title} />

      <section>
        <h2>Try it</h2>
        {tool.toolKind === "mathForCs" && <MathForCs />}
        {tool.toolKind === "dataTypes" && <DataTypes />}
        {tool.toolKind === "functionsCallStack" && <FunctionsCallStack />}
        {tool.toolKind === "howTheInternetWorks" && <HowTheInternetWorks />}
        {tool.toolKind === "algorithmIntro" && <AlgorithmIntro />}
        {tool.toolKind === "bigOChart" && <BigOChart />}
        {tool.toolKind === "bitCalculator" && <BitCalculator />}
        {tool.toolKind === "floatCalculator" && <FloatCalculator />}
        {tool.toolKind === "endianness" && <EndiannessCalculator />}
        {tool.toolKind === "ipSubnetCalculator" && <IpSubnetCalculator />}
        {tool.toolKind === "logicGates" && <LogicGates />}
        {tool.toolKind === "computerArchitecture" && <ComputerArchitecture />}
        {tool.toolKind === "dynamicArrayGrowth" && <DynamicArrayGrowth />}
        {tool.toolKind === "threadsProcesses" && <ThreadsProcesses />}
        {tool.toolKind === "raceConditions" && <RaceConditions />}
        {tool.toolKind === "syncPrimitives" && <SyncPrimitives />}
        {tool.toolKind === "deadlock" && <Deadlock />}
        {tool.toolKind === "producerConsumer" && <ProducerConsumer />}
        {tool.toolKind === "asyncAwait" && <AsyncAwait />}
        {tool.toolKind === "stackHeapGc" && <StackHeapGc />}
        {tool.toolKind === "memoryHierarchy" && <MemoryHierarchy />}
        {tool.toolKind === "cpuScheduling" && <CpuScheduling />}
        {tool.toolKind === "kernelModeSyscalls" && <KernelModeSyscalls />}
        {tool.toolKind === "runningAProgram" && <RunningAProgram />}
        {tool.toolKind === "compiledInterpreted" && <CompiledInterpreted />}
        {tool.toolKind === "linkersLibraries" && <LinkersLibraries />}
        {tool.toolKind === "textEncoding" && <TextEncoding />}
        {tool.toolKind === "plcScanCycle" && <PlcScanCycle />}
        {tool.toolKind === "networkLayers" && <NetworkLayers />}
        {tool.toolKind === "tcpVsUdp" && <TcpVsUdp />}
        {tool.toolKind === "dnsHttpTrace" && <DnsHttpTrace />}
        {tool.toolKind === "hashTableSim" && <HashTableSim />}
        {tool.toolKind === "ladderLogicBasics" && <LadderLogicBasics />}
        {tool.toolKind === "digitalAnalogIo" && <DigitalAnalogIo />}
        {tool.toolKind === "plcMemoryAddressing" && <PlcMemoryAddressing />}
        {tool.toolKind === "industrialNetworking" && <IndustrialNetworking />}
        {tool.toolKind === "safetyRedundancy" && <PlcSafetyRedundancy />}
        {tool.toolKind === "oopBasics" && <OopBasics />}
        {tool.toolKind === "interfacesAbstraction" && <InterfacesAbstraction />}
        {tool.toolKind === "servicesDependencyInjection" && <ServicesDependencyInjection />}
        {tool.toolKind === "commonDesignPatterns" && <CommonDesignPatterns />}
        {tool.toolKind === "solidPrinciples" && <SolidPrinciples />}
        {tool.toolKind === "creationalPatterns" && <DesignPatternCatalog key="creational" family="creational" />}
        {tool.toolKind === "structuralPatterns" && <DesignPatternCatalog key="structural" family="structural" />}
        {tool.toolKind === "behavioralPatterns" && <DesignPatternCatalog key="behavioral" family="behavioral" />}
        {tool.toolKind === "designPatternQuiz" && <DesignPatternQuiz />}
        {tool.toolKind === "sqlBasics" && <SqlBasics />}
        {tool.toolKind === "sqlJoins" && <SqlJoins />}
        {tool.toolKind === "sqlAggregation" && <SqlAggregation />}
        {tool.toolKind === "sqlIndexes" && <SqlIndexes />}
        {tool.toolKind === "sqlTransactions" && <SqlTransactions />}
        {tool.toolKind === "sqlSchemaDesign" && <SqlSchemaDesign />}
        {tool.toolKind === "authnAuthz" && <AuthnAuthz />}
        {tool.toolKind === "hashingEncryption" && <HashingEncryption />}
        {tool.toolKind === "tlsCertificates" && <TlsCertificates />}
        {tool.toolKind === "sqlInjection" && <SqlInjection />}
        {tool.toolKind === "xss" && <XssDemo />}
        {LINUX_LESSON[tool.toolKind] && (
          <Suspense fallback={<p className="status-text">Loading the terminal…</p>}>
            <LinuxLab key={tool.id} lesson={LINUX_LESSON[tool.toolKind]!} />
          </Suspense>
        )}
        {tool.toolKind === "containers" && <ContainersK8s />}
        {tool.toolKind === "capacityEstimation" && <CapacityEstimation />}
        {tool.toolKind === "loadBalancing" && <LoadBalancing />}
        {tool.toolKind === "caching" && <Caching />}
        {tool.toolKind === "replicationSharding" && <ReplicationSharding />}
        {tool.toolKind === "consistentHashing" && <ConsistentHashing />}
        {tool.toolKind === "messageQueues" && <MessageQueues />}
        {tool.toolKind === "rateLimiting" && <RateLimiting />}
        {tool.toolKind === "capConsistency" && <CapConsistency />}
        {tool.toolKind === "cdn" && <Cdn />}
        {tool.toolKind === "asyncSystems" && <AsyncSystems />}
        {tool.toolKind === "tailLatency" && <TailLatency />}
        {tool.toolKind === "resilience" && <Resilience />}
        {tool.toolKind === "observability" && <Observability />}
        {tool.toolKind === "scaleLab" && <ScaleLab />}
        {tool.toolKind === "apiRestHttp" && <ApiRestHttp />}
        {tool.toolKind === "apiStyles" && <ApiStyles />}
        {tool.toolKind === "apiPagination" && <ApiPagination />}
        {tool.toolKind === "apiIdempotency" && <ApiIdempotency />}
        {tool.toolKind === "apiEvolution" && <ApiEvolution />}
        {tool.toolKind === "apiAuthLimits" && <ApiAuthLimits />}
        {tool.toolKind === "designApiPhotoSharing" && <DesignInterview key="apiPhotoSharing" design="apiPhotoSharing" />}
        {tool.toolKind === "designUrlShortener" && <DesignInterview key="urlShortener" design="urlShortener" />}
        {tool.toolKind === "designNewsFeed" && <DesignInterview key="newsFeed" design="newsFeed" />}
        {tool.toolKind === "designChat" && <DesignInterview key="chat" design="chat" />}
        {tool.toolKind === "designRateLimiter" && <DesignInterview key="rateLimiter" design="rateLimiter" />}
        {tool.toolKind === "designKeyValueStore" && <DesignInterview key="keyValueStore" design="keyValueStore" />}
        {tool.toolKind === "designWebCrawler" && <DesignInterview key="webCrawler" design="webCrawler" />}
        {tool.toolKind === "designNotificationSystem" && <DesignInterview key="notificationSystem" design="notificationSystem" />}
        {tool.toolKind === "designVideoStreaming" && <DesignInterview key="videoStreaming" design="videoStreaming" />}
        {tool.toolKind === "designRideSharing" && <DesignInterview key="rideSharing" design="rideSharing" />}
        {tool.toolKind === "designJobScheduler" && <DesignInterview key="jobScheduler" design="jobScheduler" />}
        {tool.toolKind === "designPaymentSystem" && <DesignInterview key="paymentSystem" design="paymentSystem" />}
        {tool.toolKind === "designParkingLot" && <DesignInterview key="parkingLot" design="parkingLot" />}
        {tool.toolKind === "designElevator" && <DesignInterview key="elevator" design="elevator" />}
        {tool.toolKind === "designVendingMachine" && <DesignInterview key="vendingMachine" design="vendingMachine" />}
        {tool.toolKind === "designTicketBooking" && <DesignInterview key="ticketBooking" design="ticketBooking" />}
        {tool.toolKind === "designCardGame" && <DesignInterview key="cardGame" design="cardGame" />}
        {tool.toolKind === "gitBasics" && <GitBasics />}
        {tool.toolKind === "gitBranching" && <GitBranching />}
        {tool.toolKind === "testPyramid" && <TestPyramid />}
        {tool.toolKind === "testDoubles" && <TestDoubles />}
        {tool.toolKind === "tddCoverage" && <TddCoverage />}
        {tool.toolKind === "aiAssistedEngineering" && <AiAssistedEngineering />}
        {tool.toolKind === "complexityAnalysis" && <ComplexityAnalysis />}
        {tool.toolKind === "complexityRecursion" && <ComplexityRecursion />}
        {tool.toolKind === "complexityAmortized" && <ComplexityAmortized />}
        {tool.toolKind === "complexityVariables" && <ComplexityVariables />}
        {tool.toolKind === "complexityHiddenCosts" && <ComplexityHiddenCosts />}
        {tool.toolKind === "complexitySpace" && <ComplexitySpace />}
        {tool.toolKind === "complexityExplaining" && <ComplexityExplaining />}
        {tool.toolKind === "complexityGym" && <ComplexityGym />}
        {tool.toolKind === "greedyAlgorithms" && <GreedyAlgorithms />}
        {tool.toolKind === "mathInterview" && <MathInterview />}
        {tool.toolKind === "bitTricks" && <BitTricks />}
        {tool.toolKind === "rangeQueries" && <RangeQueries />}
        {tool.toolKind === "lazyPropagation" && <LazyPropagation />}
        {tool.toolKind === "patternDrill" && <PatternDrill />}
        {tool.toolKind === "blockReps" && <BlockReps />}
        {tool.toolKind === "mixedSet" && <MixedSet />}
        {tool.toolKind === "prepPlan" && <PrepPlan />}
        {tool.toolKind === "itStudyPath" && <PrepPlan key="it-cs" initialPath="it-cs" />}
        {tool.toolKind === "behavioralStar" && <BehavioralStar />}
        {tool.toolKind === "behavioralStoryBank" && <StoryBank />}
        {tool.toolKind === "behavioralMock" && <BehavioralMock />}
        {tool.toolKind === "glossary" && <GlossaryList />}
        {tool.toolKind === "glossaryFlashCards" && <GlossaryFlashCards />}
        {tool.toolKind === "glossaryQuiz" && <GlossaryQuiz />}
        {tool.toolKind === "aiMlBasics" && <AiMlBasics />}
        {tool.toolKind === "aiNeuralNetworks" && <AiNeuralNetworks />}
        {tool.toolKind === "aiTokensEmbeddings" && <AiTokensEmbeddings />}
        {tool.toolKind === "aiTransformersAttention" && <AiTransformers />}
        {tool.toolKind === "aiLlmTraining" && <AiLlmTraining />}
        {tool.toolKind === "aiUsingLlms" && <AiUsingLlms />}
        {tool.toolKind === "aiRisksLimits" && <AiRisksLimits />}
        {LANG_LESSONS[tool.toolKind] && <LangLesson key={tool.id} lesson={LANG_LESSONS[tool.toolKind]!} />}
        {tool.toolKind === "langCheatSheetCSharp" && <LangCheatSheet key="csharp" mode="csharp" />}
        {tool.toolKind === "langCheatSheetPython" && <LangCheatSheet key="python" mode="python" />}
        {tool.toolKind === "langTranslationTable" && <LangCheatSheet key="translate" mode="translate" />}
        {OPS_LESSONS[tool.toolKind] && <OpsLesson key={tool.id} lesson={OPS_LESSONS[tool.toolKind]!} />}
        {tool.toolKind === "subnettingPractice" && <SubnettingPractice />}
        {tool.toolKind === "arpSwitching" && <ArpSwitching />}
        {tool.toolKind === "vlans" && <Vlans />}
        {tool.toolKind === "dhcp" && <Dhcp />}
        {tool.toolKind === "wifiBasics" && <WifiBasics />}
        {tool.toolKind === "routingGateways" && <RoutingGateways />}
        {tool.toolKind === "natPortForwarding" && <NatPortForwarding />}
        {tool.toolKind === "firewallsPorts" && <FirewallsPorts />}
        {tool.toolKind === "vpns" && <Vpns />}
        {tool.toolKind === "netTroubleshooting" && <NetTroubleshooting />}
        {tool.toolKind === "owaspTop10" && <OwaspTop10 />}
        {tool.toolKind === "accessControlAttacks" && <AccessControlAttacks />}
        {tool.toolKind === "deserializationMisconfig" && <DeserializationMisconfig />}
        {tool.toolKind === "secretsLeastPrivilege" && <SecretsLeastPrivilege />}
        {tool.toolKind === "threatModelingStride" && <ThreatModelingStride />}
        {tool.toolKind === "passwordsMfa" && <PasswordsMfa />}
        {tool.toolKind === "phishingSocial" && <PhishingSocial />}
        {tool.toolKind === "incidentResponseLogging" && <IncidentResponseLogging />}
        {tool.toolKind === "otIcsSecurity" && <OtIcsSecurity />}
        {tool.toolKind === "aiGlossaryQuiz" && <GlossaryQuiz key="ai" onlyCategory="ai" />}
        {tool.toolKind === "plcStLesson" && PLC_LESSON_BY_ID[tool.id] && <PlcLesson key={tool.id} lesson={PLC_LESSON_BY_ID[tool.id]} />}
        {tool.toolKind === "plcStExercise" && PLC_EXERCISE_BY_ID[tool.id] && <PlcExercise key={tool.id} ex={PLC_EXERCISE_BY_ID[tool.id]} />}
        {tool.toolKind === "plcMicro850Lab" && MICRO850_LAB_BY_ID[tool.id] && <Micro850Lab key={tool.id} lab={MICRO850_LAB_BY_ID[tool.id]} />}
      </section>
    </div>
  );
}
