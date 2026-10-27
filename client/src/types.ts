// One sidebar row, covering both lesson kinds. `kind` decides which detail file to
// fetch and which view component to render (see App.tsx).
export interface NavItem {
  id: string;
  kind: "practice" | "tool";
  section: string;
  track: string;
  title: string;
  oneLiner: string;
  completed: boolean;
}

export interface VisualizationStep {
  state: Record<string, unknown>;
  highlightIndices: number[];
  message: string;
}

export type VisualizerKind = "array" | "linkedList" | "stack" | "hashMap" | "callStack" | "tree" | "graph" | "grid";

export interface TestCaseDisplay {
  inputDisplay: string;
  expectedJson: string;
}

export interface ConceptDetail {
  id: string;
  section: string;
  track: string;
  title: string;
  oneLiner: string;
  keyTakeaway: string;
  explanation: string;
  visualizerKind: VisualizerKind;
  starterCode: Record<string, string>;
  functionNames: Record<string, string>;
  testCases: TestCaseDisplay[];
  visualizationSteps: VisualizationStep[];
  completed: boolean;
  pythonHarnessPreamble: string | null;
  pythonCallTemplate: string | null;
  // For grading C# in the browser (csharpWasmRunner.ts). ("cSharp": the C# export camel-cases "CSharp" that way.)
  cSharpHarnessPreamble?: string | null;
  cSharpCallTemplate?: string | null;
  recognitionSignals: string[];
  gotchas: string[];
  confusableWith: string[];
  complexity: ComplexityInfo | null;
  referenceSolutions: Record<string, string>;
  attempts: number;
  evidence: LessonEvidence;
  // Transfer exercises: the lesson this one follows, and the transfer problem that follows this.
  transferOf: LessonLink | null;
  transferNext: LessonLink | null;
}

export interface LessonLink {
  id: string;
  title: string;
}

// How the learner has practised one graded lesson, across languages (see
// progressCore.ts). assistedPass: passed from the guided starter or with the reference seen in
// the week before; independentPass: passed from the bare or timed starter without it; timedPass:
// passed inside the mixed interview set; unrecordedPass: passed before these were recorded.
export interface LessonEvidence {
  conceptId: string;
  attempted: boolean;
  lastRevealedAt: string | null;
  assistedPass: boolean;
  independentPass: boolean;
  timedPass: boolean;
  unrecordedPass: boolean;
}

export interface ComplexityInfo {
  time: string;
  space: string;
  note: string;
  alsoTime: string[] | null;
  alsoSpace: string[] | null;
}

// A completed lesson that's now due to be re-solved; see getDue in progressCore.ts for the
// review ladder.
export interface ReviewItem {
  conceptId: string;
  title: string;
  section: string;
  track: string;
  dueSince: string;
  stage: number;
  daysOverdue: number;
}

export interface TestResult {
  inputDisplay: string;
  expectedJson: string;
  actualJson: string | null;
  passed: boolean;
  error: string | null;
}

export interface ExecuteResponse {
  allPassed: boolean;
  results: TestResult[];
  compileError: string | null;
}

export type ToolKind =
  | "bitCalculator"
  | "floatCalculator"
  | "ipSubnetCalculator"
  | "endianness"
  | "bigOChart"
  | "logicGates"
  | "computerArchitecture"
  | "algorithmIntro"
  | "dynamicArrayGrowth"
  | "plcScanCycle"
  | "networkLayers"
  | "tcpVsUdp"
  | "dnsHttpTrace"
  | "hashTableSim"
  | "ladderLogicBasics"
  | "digitalAnalogIo"
  | "plcMemoryAddressing"
  | "industrialNetworking"
  | "safetyRedundancy"
  | "oopBasics"
  | "interfacesAbstraction"
  | "servicesDependencyInjection"
  | "commonDesignPatterns"
  | "solidPrinciples"
  | "creationalPatterns"
  | "structuralPatterns"
  | "behavioralPatterns"
  | "designPatternQuiz"
  | "sqlBasics"
  | "sqlJoins"
  | "sqlAggregation"
  | "sqlIndexes"
  | "sqlTransactions"
  | "sqlSchemaDesign"
  | "authnAuthz"
  | "hashingEncryption"
  | "tlsCertificates"
  | "sqlInjection"
  | "xss"
  | "linuxFiles"
  | "linuxPermissions"
  | "linuxPipes"
  | "linuxProcesses"
  | "containers"
  | "capacityEstimation"
  | "loadBalancing"
  | "caching"
  | "replicationSharding"
  | "consistentHashing"
  | "messageQueues"
  | "rateLimiting"
  | "capConsistency"
  | "designUrlShortener"
  | "designNewsFeed"
  | "designChat"
  | "designRateLimiter"
  | "designKeyValueStore"
  | "designWebCrawler"
  | "designNotificationSystem"
  | "designVideoStreaming"
  | "designRideSharing"
  | "designParkingLot"
  | "designElevator"
  | "designVendingMachine"
  | "designTicketBooking"
  | "designCardGame"
  | "gitBasics"
  | "gitBranching"
  | "complexityAnalysis"
  | "complexityRecursion"
  | "complexityAmortized"
  | "complexityVariables"
  | "complexityHiddenCosts"
  | "complexitySpace"
  | "complexityExplaining"
  | "complexityGym"
  | "patternDrill"
  | "mixedSet"
  | "behavioralStar"
  | "behavioralStoryBank"
  | "behavioralMock"
  | "prepPlan"
  | "glossary"
  | "glossaryFlashCards"
  | "glossaryQuiz"
  | "threadsProcesses"
  | "raceConditions"
  | "syncPrimitives"
  | "deadlock"
  | "producerConsumer"
  | "asyncAwait"
  | "stackHeapGc"
  | "memoryHierarchy"
  | "aiMlBasics"
  | "aiNeuralNetworks"
  | "aiTokensEmbeddings"
  | "aiTransformersAttention"
  | "aiLlmTraining"
  | "aiUsingLlms"
  | "aiRisksLimits"
  | "aiGlossaryQuiz"
  | "cpuScheduling"
  | "kernelModeSyscalls"
  | "runningAProgram"
  | "compiledInterpreted"
  | "linkersLibraries"
  | "textEncoding"
  | "testPyramid"
  | "testDoubles"
  | "tddCoverage"
  | "mathForCs"
  | "dataTypes"
  | "functionsCallStack"
  | "howTheInternetWorks"
  | "langStartHere"
  | "langVariables"
  | "langStrings"
  | "langConditionals"
  | "langLoops"
  | "langFunctions"
  | "langCollections"
  | "langExceptions"
  | "langClasses"
  | "langCheatSheetCSharp"
  | "langCheatSheetPython"
  | "langTranslationTable"
  | "greedyAlgorithms"
  | "mathInterview"
  | "bitTricks"
  | "rangeQueries"
  | "lazyPropagation"
  | "langLambdas"
  | "langLinq"
  | "langInterfaces"
  | "langGenerics"
  | "langIterators"
  | "langRecords"
  | "langValuesReferences"
  | "langFilesFormatting"
  | "langAsync"
  | "langTesting"
  | "langModules"
  | "linuxScriptingBasics"
  | "linuxScriptingRobust"
  | "linuxTextProcessing"
  | "linuxSystemd"
  | "linuxPackages"
  | "linuxCron"
  | "linuxSsh"
  | "linuxDisksLogs"
  | "winProcessesServices"
  | "winEventLogs"
  | "winNtfsPermissions"
  | "psObjectsPipeline"
  | "psCmdletsHelp"
  | "psScriptingRemoting"
  | "adDomainsOus"
  | "adGpoKerberos"
  | "bashVsPowerShell"
  | "cloudBasics"
  | "cloudContainerImages"
  | "cloudKubernetes"
  | "cloudCicd"
  | "cloudIac"
  | "cloudObservability"
  | "gitTeamWorkflows"
  | "tailLatency"
  | "resilience"
  | "cdn"
  | "asyncSystems"
  | "observability"
  | "scaleLab"
  | "designJobScheduler"
  | "designPaymentSystem"
  | "apiRestHttp"
  | "apiStyles"
  | "apiPagination"
  | "apiIdempotency"
  | "apiEvolution"
  | "apiAuthLimits"
  | "designApiPhotoSharing"
  | "aiAssistedEngineering"
  | "plcStLesson"
  | "plcStExercise"
  | "plcMicro850Lab"
  | "subnettingPractice"
  | "arpSwitching"
  | "vlans"
  | "dhcp"
  | "wifiBasics"
  | "routingGateways"
  | "natPortForwarding"
  | "firewallsPorts"
  | "vpns"
  | "netTroubleshooting"
  | "owaspTop10"
  | "accessControlAttacks"
  | "deserializationMisconfig"
  | "secretsLeastPrivilege"
  | "threatModelingStride"
  | "passwordsMfa"
  | "phishingSocial"
  | "incidentResponseLogging"
  | "otIcsSecurity"
  | "itStudyPath"
  | "langMemory"
  | "langConcurrency"
  | "langAsyncAdvanced"
  | "langDecoratorsContext"
  | "langMetaprogramming"
  | "langAdvancedGenerics"
  | "langPatternMatching"
  | "langFunctional"
  | "langErrorPatterns"
  | "langProfiling"
  | "langPackaging"
  | "blockReps"
  | "bugLog";

export interface ToolDetail {
  id: string;
  section: string;
  track: string;
  title: string;
  oneLiner: string;
  keyTakeaway: string;
  explanation: string;
  toolKind: ToolKind;
}
