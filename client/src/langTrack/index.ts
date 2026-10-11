import type { ToolKind } from "../types";
import { startHere } from "./startHere.ts";
import type { LangLessonData } from "./types.ts";
import { classes } from "./classes.ts";
import { exceptions } from "./exceptions.ts";
import { collections } from "./collections.ts";
import { functions } from "./functions.ts";
import { loops } from "./loops.ts";
import { conditionals } from "./conditionals.ts";
import { strings } from "./strings.ts";
import { variables } from "./variables.ts";
import { lambdas } from "./lambdas.ts";
import { linq } from "./linq.ts";
import { interfaces } from "./interfaces.ts";
import { generics } from "./generics.ts";
import { iterators } from "./iterators.ts";
import { records } from "./records.ts";
import { valuesReferences } from "./valuesReferences.ts";
import { filesFormatting } from "./filesFormatting.ts";
import { asyncBasics } from "./async.ts";
import { testing } from "./testing.ts";
import { modules } from "./modules.ts";
import { memory } from "./memory.ts";
import { concurrency } from "./concurrency.ts";
import { asyncAdvanced } from "./asyncAdvanced.ts";
import { decorators } from "./decorators.ts";
import { metaprogramming } from "./metaprogramming.ts";
import { advancedGenerics } from "./advancedGenerics.ts";
import { patternMatching } from "./patternMatching.ts";
import { functional } from "./functional.ts";
import { errorPatterns } from "./errorPatterns.ts";
import { profiling } from "./profiling.ts";
import { packaging } from "./packaging.ts";

// Which data file each lesson kind of the "Programming in C# & Python" section renders.
// A new lesson (stage 2 and 3 included) adds its data file and one line here.
export const LANG_LESSONS: Partial<Record<ToolKind, LangLessonData>> = {
  langStartHere: startHere,
  langVariables: variables,
  langStrings: strings,
  langConditionals: conditionals,
  langLoops: loops,
  langFunctions: functions,
  langCollections: collections,
  langExceptions: exceptions,
  langClasses: classes,
  langLambdas: lambdas,
  langLinq: linq,
  langInterfaces: interfaces,
  langGenerics: generics,
  langIterators: iterators,
  langRecords: records,
  langValuesReferences: valuesReferences,
  langFilesFormatting: filesFormatting,
  langAsync: asyncBasics,
  langTesting: testing,
  langModules: modules,
  langMemory: memory,
  langConcurrency: concurrency,
  langAsyncAdvanced: asyncAdvanced,
  langDecoratorsContext: decorators,
  langMetaprogramming: metaprogramming,
  langAdvancedGenerics: advancedGenerics,
  langPatternMatching: patternMatching,
  langFunctional: functional,
  langErrorPatterns: errorPatterns,
  langProfiling: profiling,
  langPackaging: packaging,
};
