using DsaAcademy.Content.Concepts;

namespace DsaAcademy.Content;

// The full catalog of concepts, in the order they should be taught. Add a new concept
// class under Concepts/ and list it here -- nothing else needs to change (the export, the
// graders and the progress store are all generic over IConcept).
public static class ConceptRegistry
{
    private static readonly List<IConcept> All =
    [
        new ArrayTraversalSum(),
        new ArrayFindMax(),
        new ArrayReverseInPlace(),
        new LinkedListTraversal(),
        new DoublyLinkedListReverse(),
        new StringIsPalindrome(),
        new StackValidParentheses(),
        new QueueSimulate(),
        new HashMapTwoSum(),
        new RecursionFactorial(),
        new RecursionFibonacci(),
        new BstInsert(),
        new BstSearch(),
        new BstDelete(),
        new BinaryTreeInorderTraversal(),
        new BinaryTreeLevelOrder(),
        new HeapPushPop(),
        new GraphBfsTraversal(),
        new GraphDfsTraversal(),
        new GraphDijkstraShortestPath(),
        new GraphNetworkDelayTime(), // transfer exercise
        new SortingBubbleSort(),
        new SortingInsertionSort(),
        new SortingSelectionSort(),
        new SortingMergeTwoSortedArrays(),
        new SortingQuickSortPartition(),
        new DpFibonacciMemo(),
        new DpClimbingStairs(),
        new DpLongestIncreasingSubsequence(),
        new DpLongestPalindromicSubstring(),
        // Patterns track: grouped by underlying mechanism (binary search family,
        // then pointer/scan techniques, then range/aggregation, then heap, then
        // graph, then DP-shaped, then backtracking/bitmask) rather than addition
        // order, so related patterns sit next to each other for learning flow.
        new BinarySearchArray(),
        new BinarySearchRange(),
        new BinarySearchOnAnswer(),
        new BinarySearchRotated(),
        new BinarySearchRotatedMin(), // transfer exercise
        new BinarySearchSplitArray(),
        new TwoPointersSortedTwoSum(),
        new TwoPointersThreeSum(), // transfer exercise
        new TwoPointersTrappingRainWater(),
        new FastSlowPointersMiddle(),
        new LinkedListReverse(),
        new LinkedListReverseBetween(), // transfer exercise
        new LinkedListCycleStart(),
        new LinkedListRemoveNth(),
        new LinkedListMergeSorted(),
        new SlidingWindowMaxSum(),
        new SlidingWindowLongestUnique(),
        new SlidingWindowCharReplacement(), // transfer exercise
        new StringMinWindow(),
        new MonotonicStackNextGreater(),
        new MonotonicStackDailyTemperatures(), // transfer exercise
        new SlidingWindowMaximum(),
        new PrefixSumsRangeQuery(),
        new HashMapSubarraySumK(), // transfer exercise
        new MergeIntervals(),
        new IntervalsListIntersections(), // transfer exercise
        new IntervalsInsert(),
        new IntervalsMeetingRooms(),
        new IntervalsNonOverlapping(),
        new TopKHeap(),
        new HeapKClosestPoints(), // transfer exercise
        new HeapMergeKSorted(),
        new HeapRunningMedian(),
        new DesignMinStack(),
        new DesignLruCache(),
        new TreeValidateBst(),
        new TreeKthSmallestBst(), // transfer exercise
        new TreeDiameter(),
        new TreeLowestCommonAncestor(),
        new UnionFindComponents(),
        new UnionFindRedundantConnection(), // transfer exercise
        new GridNumberOfIslands(),
        new GridMaxAreaIsland(), // transfer exercise
        new GridRottingOranges(),
        new GraphMinimumSpanningTree(),
        new TopologicalSort(),
        new GraphParallelCourses(), // transfer exercise
        new GraphCourseSchedule(),
        new GraphClone(),
        new LinkedListCopyRandom(), // transfer exercise
        new GraphWordLadder(),
        new GraphBipartite(),
        new DeadlockDetection(),
        new DpHouseRobber(),
        new DpHouseRobberCircular(), // transfer exercise
        new DpStockCooldown(),
        new Knapsack01(),
        new DpCoinChange(),
        new DpCoinChangeWays(), // transfer exercise
        new DpEditDistance(),
        new DpLongestCommonSubsequence(),
        new TriePrefixCount(),
        new TrieReplaceWords(), // transfer exercise
        new StringGroupAnagrams(),
        new StringKmpSearch(),
        new BacktrackingSubsets(),
        new BacktrackingSubsetsWithDuplicates(), // transfer exercise
        new BacktrackingPermutations(),
        new BacktrackingWordSearch(),
        new BacktrackingNQueens(),
        new BitManipulationCountSetBits(),
        // Greedy, math and bits tracks (Order 110 to 131, after Patterns and before the drills).
        new GreedyAssignCookies(),
        new GreedyJumpGame(),
        new GreedyJumpGameII(),
        new GreedyGasStation(),
        new GreedyPartitionLabels(),
        new GreedyMaxSubarray(),
        new GreedyMaxProductSubarray(), // transfer exercise
        new MathCountPrimes(),
        new MathPow(),
        new MathGcdLcm(),
        new MathHappyNumber(),
        new MathExcelColumnTitle(),
        new MathReverseInteger(),
        new BitsSingleNumber(),
        new BitsMissingNumber(),
        new BitsPowerOfTwo(),
        new BitsCountingBits(),
        new BitsReverseBits(),
        new BitsSumOfTwoIntegers(),
        new BitsSubsetsBitmask(),
        // Range queries track (Order 140 to 142): segment trees and Fenwick trees.
        new SegmentTreeRangeSumMutable(),
        new SegmentTreeRangeMin(),
        new FenwickRangeAddPointQuery(),
        new FenwickCountSmallerAfterSelf(),
        new FenwickCountInversions(),
        // Programming in C# & Python, basics track (sorted into the section by Order).
        new BasicsCelsiusToFahrenheit(),
        new BasicsCountVowels(),
        new BasicsReverseWords(),
        new BasicsLetterGrade(),
        new BasicsSumOfEvens(),
        new BasicsFizzBuzz(),
        new BasicsRunningTotal(),
        new BasicsFirstIndex(),
        new BasicsGreeting(),
        new BasicsWordFrequency(),
        new BasicsRemoveDuplicates(),
        new BasicsCommonElements(),
        new BasicsSumValidNumbers(),
        new BasicsRectangleClass(),
        // Programming in C# & Python, intermediate track.
        new InterComposeFunctions(),
        new InterSortByLength(),
        new InterGroupByLength(),
        new InterPassingNames(),
        new InterShapeAreas(),
        new InterMinMax(),
        new InterGenericStack(),
        new InterChunkList(),
        new InterFibonacciGenerator(),
        new InterDistinctPoints(),
        new InterGridWithCell(),
        new InterFormatRow(),
        new InterParseSettings(),
        // Programming in C# & Python, advanced track.
        new AdvSumFieldsSpan(),
        new AdvCleanupOrder(),
        new AdvMemoize(),
        new AdvVectorOperators(),
        new AdvInclusiveRange(),
        new AdvGenericTotal(),
        new AdvCommandRouter(),
        new AdvShippingRate(),
        new AdvRunLength(),
        new AdvRetryBackoff(),
        new AdvParseResult(),
        new AdvFastActiveOrders(),
        new AdvSemverCompare(),
    ];

    private static readonly Dictionary<string, IConcept> ById = All.ToDictionary(c => c.Id);

    public static IConcept? Find(string id) => ById.GetValueOrDefault(id);

    public static IReadOnlyList<IConcept> GetAll() => All;

    // Parent id -> the transfer exercise that names it in TransferOf (the first one listed,
    // if several do).
    private static readonly Dictionary<string, IConcept> TransferByParent = All
        .Where(c => c.TransferOf is not null)
        .GroupBy(c => c.TransferOf!)
        .ToDictionary(g => g.Key, g => g.First());

    public static IConcept? TransferNext(string parentId) => TransferByParent.GetValueOrDefault(parentId);

    private static LessonLink? Link(IConcept? c) => c is null ? null : new LessonLink(c.Id, c.Title);

    public static ConceptDetail ToDetail(this IConcept concept, bool completed, int attempts, LessonEvidence evidence) => new(
        Id: concept.Id,
        Section: concept.Section,
        Track: concept.Track,
        Title: concept.Title,
        OneLiner: concept.OneLiner,
        KeyTakeaway: concept.KeyTakeaway,
        Explanation: concept.Explanation,
        VisualizerKind: concept.VisualizerKind,
        StarterCode: concept.StarterCode,
        FunctionNames: concept.FunctionNames,
        TestCases: concept.TestCases.Select(t => new TestCaseDisplay(t.InputLiteral, t.ExpectedJson)).ToList(),
        VisualizationSteps: concept.BuildVisualizationSteps(),
        Completed: completed,
        PythonHarnessPreamble: concept.PythonHarnessPreamble,
        PythonCallTemplate: concept.FunctionNames.ContainsKey("python") ? concept.PythonCallTemplate : null,
        CSharpHarnessPreamble: concept.CSharpHarnessPreamble,
        CSharpCallTemplate: concept.FunctionNames.ContainsKey("csharp") ? concept.CSharpCallTemplate : null,
        RecognitionSignals: concept.RecognitionSignals,
        Gotchas: concept.Gotchas,
        ConfusableWith: concept.ConfusableWith,
        Complexity: ComplexityCatalog.Find(concept.Id),
        ReferenceSolutions: SolutionCatalog.For(concept.Id),
        Attempts: attempts,
        Evidence: evidence,
        TransferOf: Link(concept.TransferOf is { } parent ? Find(parent) : null),
        TransferNext: Link(TransferNext(concept.Id))
    );
}
