import { src, type OpsLessonData } from "../types.ts";

export const probability: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Counting and probability turn up all over programming: how many test cases a feature needs, how likely two hashed keys collide, how many retries a flaky call needs, what a randomized algorithm costs on average, and the brain teasers interviewers still like. You don't need much theory, just a handful of counting rules and a feel for a few results that surprise almost everyone.",
        "This lesson covers permutations and combinations, the basic probability rules, expected value, and the birthday paradox, with Python checking the arithmetic.",
      ],
    },
    {
      kind: "table",
      title: "Counting rules",
      head: ["Question", "Count", "Example"],
      rows: [
        ["Independent choices in a row", "multiply: a × b × c", "3 shirts and 4 trousers: 12 outfits"],
        ["Order all n items", "n! (n factorial)", "5 people in a queue: 120 orders"],
        ["Order k of n items (permutations)", "n! / (n − k)!", "gold and silver among 5 runners: 20"],
        ["Choose k of n, order doesn't matter (combinations)", "n! / (k! (n − k)!), written C(n, k)", "a 2-person team from 5: 10"],
        ["Subsets of n items", "2^n", "toppings on or off for 10 toppings: 1,024 pizzas"],
        ["Strings of length k from an alphabet of a", "a^k", "4-digit PINs: 10,000"],
      ],
      notes: ["The same numbers set the size of brute-force searches: generating all permutations is O(n!), all subsets O(2^n), and all k-combinations O(C(n, k)). Ten items give 3.6 million permutations; twenty give 2.4 × 10^18, which no computer will finish."],
    },
    {
      kind: "code",
      title: "Counting and probability in Python",
      blocks: [
        {
          lang: "python",
          label: "prob.py",
          code: src`
import math, random
from itertools import combinations, permutations

print(math.factorial(5))          # 120 orderings of 5 items
print(math.perm(5, 2))            # 20 ordered pairs: first and second place
print(math.comb(5, 2))            # 10 unordered pairs: a team of 2
print(len(list(permutations("abc"))), len(list(combinations("abcd", 2))))   # 6 6

# Birthday paradox: chance that 23 people include a shared birthday
p_all_different = math.prod((365 - i) / 365 for i in range(23))
print(round(1 - p_all_different, 3))

# Expected value: a fair die, then a quick simulation to check it
print(sum(range(1, 7)) / 6)
random.seed(7)
rolls = [random.randint(1, 6) for _ in range(100_000)]
print(round(sum(rolls) / len(rolls), 2))`,
          output: src`
120
20
10
6 6
0.507
3.5
3.5`,
        },
      ],
      notes: ["Simulating is a good habit for checking a probability answer: if your formula says 0.507 and a million random trials say 0.31, one of them is wrong. Seeding the generator (random.seed, new Random(seed) in C#) makes a simulation repeatable."],
    },
    {
      kind: "terms",
      title: "Probability rules",
      terms: [
        { term: "Probability of an event", meaning: "with equally likely outcomes, favourable outcomes divided by all outcomes: rolling an even number is 3/6." },
        { term: "Complement", meaning: "P(not A) = 1 − P(A). Often the easy way in: \"at least one\" is 1 minus \"none at all\"." },
        { term: "Independent events, and", meaning: "P(A and B) = P(A) × P(B) when one doesn't affect the other: two heads in a row is 1/2 × 1/2 = 1/4." },
        { term: "Mutually exclusive events, or", meaning: "P(A or B) = P(A) + P(B) when they can't both happen; in general subtract the overlap, P(A) + P(B) − P(A and B)." },
        { term: "Conditional probability", meaning: "P(A given B) = P(A and B) / P(B): the chance of A once you know B happened. Bayes' rule turns it around, which is how a positive test for a rare condition can still probably be a false alarm." },
        { term: "Expected value", meaning: "the long-run average: each outcome times its probability, summed. A die averages 3.5. Expected values add up even when the events depend on each other (linearity of expectation)." },
        { term: "Geometric waiting time", meaning: "if each try succeeds with probability p, you need 1/p tries on average: a 1 in 6 chance takes 6 rolls on average." },
      ],
    },
    {
      kind: "text",
      title: "The birthday paradox",
      paragraphs: [
        "In a room of 23 people, the chance that two share a birthday is just over 50%, which sounds far too high. The trick is that you aren't asking about one particular pair: 23 people form 253 pairs, and each pair gets its own 1 in 365 chance. The clean way to compute it is the complement: the chance that all birthdays differ is 365/365 × 364/365 × ... × 343/365, and one minus that is 0.507.",
        "The same reasoning sets how soon hashes and random ids collide. With a hash of b bits, expect the first collision after roughly 2^(b/2) values, the square root of the number of possible hashes. That's why 32-bit hashes collide after about 77,000 items, and why UUIDs use 122 random bits.",
      ],
    },
    {
      kind: "widget",
      widget: "birthdayParadox",
      title: "Try it: the birthday paradox",
      intro: "Move the slider to change the size of the room. The exact probability updates, and the button checks it by simulating thousands of rooms.",
    },
    {
      kind: "steps",
      title: "Classic interview questions, and the idea behind each",
      steps: [
        "Shuffle an array so every order is equally likely: Fisher-Yates, swapping each position with a random one at or before it (see the Randomized: Fisher-Yates Shuffle exercise).",
        "Pick k random lines from a file too big to hold: reservoir sampling keeps item i with probability k/i (see Reservoir Sampling).",
        "Expected number of coin flips to get heads: 1/p = 2.",
        "Make a fair coin from a biased one: flip twice; HT means heads, TH means tails, otherwise flip again. Both orders have probability p(1 − p).",
        "Expected number of distinct values after n random draws from n: n(1 − (1 − 1/n)^n), about 63% of n. It's why a random sample with replacement misses about a third of the items.",
      ],
    },
  ],
  quiz: [
    {
      question: "How many ways can a 3-person committee be chosen from 10 people?",
      answer: "120",
      distractors: ["720", "30", "1,000"],
      why: "Order doesn't matter, so it is C(10, 3) = 10 × 9 × 8 / (3 × 2 × 1) = 120. 720 would be the ordered count (a chair, a secretary and a treasurer).",
    },
    {
      question: "A call fails 1 time in 10, independently. What is the chance that three attempts all fail?",
      answer: "1 in 1,000",
      distractors: ["3 in 10", "1 in 30", "1 in 100"],
      why: "Independent events multiply: 0.1 × 0.1 × 0.1 = 0.001. That is the maths behind retries, provided failures really are independent; during an outage they aren't.",
    },
    {
      question: "Roughly how many random 32-bit ids can you generate before a collision becomes likely?",
      answer: "About 77,000",
      distractors: ["About 4 billion", "About 2 billion", "About 1 million"],
      why: "The birthday bound: about the square root of 2^32, around 65,000, and the 50% point is near 77,000. Far fewer than the 4.3 billion possible values.",
    },
    {
      question: "What is the expected value of one roll of a fair six-sided die?",
      answer: "3.5",
      distractors: ["3", "4", "6"],
      why: "(1 + 2 + 3 + 4 + 5 + 6) / 6 = 3.5. An expected value needn't be a value that can actually occur.",
    },
  ],
  pitfalls: [
    "Adding probabilities of events that can happen together, instead of subtracting the overlap or using the complement.",
    "Treating dependent events as independent, such as retries during an outage.",
    "Mixing up permutations and combinations: ask whether order matters.",
    "Underestimating collisions in short hashes and ids because of the birthday effect.",
    "Using a predictable generator (Random, random) where security matters; use a cryptographic one.",
  ],
  next: [
    { id: "random-shuffle", label: "Randomized: Fisher-Yates Shuffle" },
    { id: "random-reservoir-sampling", label: "Randomized: Reservoir Sampling" },
    { id: "bits-subsets-bitmask", label: "Bits: All Subsets by Counting Bitmasks" },
  ],
};
