namespace DsaAcademy.Content.Tools;

public class AiTransformersAttentionTool : ITool
{
    public string Id => "ai-transformers-attention";
    public string Section => "AI & Machine Learning";
    public string Track => "language models";
    public int Order => 40;
    public string Title => "Transformers and Self-Attention";
    public string OneLiner => "The architecture behind today's language models: every token looks at the other tokens to decide what it means here, and the model predicts one next token at a time inside a fixed context window.";
    public string KeyTakeaway =>
        "A transformer turns each token's embedding into a context-aware vector by letting it attend to other " +
        "tokens: it scores how relevant each one is, turns the scores into weights that sum to 1, and takes a " +
        "weighted mix of their information. Stack many such layers and the final vector is used to predict the next " +
        "token. The model generates by repeating that prediction one token at a time, and it can only see what fits " +
        "in its context window.";

    public ToolKind ToolKind => ToolKind.AiTransformersAttention;

    public string Explanation =>
        "Earlier sequence models (recurrent networks) read text one token at a time and squeezed everything so far " +
        "into a single running state, which made long-range connections hard to learn and training hard to " +
        "parallelise. The transformer, introduced in the 2017 paper \"Attention Is All You Need\", drops the " +
        "recurrence. Every position is processed at once, and the way tokens share information is attention.\n\n" +
        "Self-attention, intuitively: in \"the robot dropped the box because it was heavy\", what does \"it\" refer " +
        "to? To build a good representation of \"it\", the model should pull in information from \"box\". Each token " +
        "produces three vectors from its embedding: a query (what am I looking for), a key (what do I contain) and a " +
        "value (what I will pass on). The query of \"it\" is compared with the key of every token (a dot product: multiply matching " +
        "entries of the two vectors and add them up), the scores are scaled and passed through softmax (a function that turns any list of scores into probabilities that sum to 1) so they become weights summing to 1, and the output for \"it\" " +
        "is the weighted sum of all the value vectors. Multi-head attention runs several of these in parallel, each " +
        "free to learn a different kind of relationship. Each attention step is followed by a small feed-forward " +
        "network applied to every position, and a model stacks dozens of these blocks. Because attention itself " +
        "ignores order, position information is added to the token vectors.\n\n" +
        "A text-generating model is usually a decoder-only transformer with causal (masked) attention: each token " +
        "may attend only to itself and earlier tokens, never later ones, because at generation time the later ones " +
        "do not exist yet. The last layer's vector at the final position is turned into a score (logit) for every " +
        "token in the vocabulary, softmax turns those into probabilities, one token is chosen, appended to the " +
        "input, and the whole thing runs again. That is all text generation is: next-token prediction in a loop, " +
        "which is why output streams token by token and why long answers take longer.\n\n" +
        "The context window is the maximum number of tokens the model can attend over at once, prompt and output " +
        "together. Anything outside it simply does not exist for the model; chat products keep a conversation going " +
        "by resending earlier turns, and may trim or summarise them when they no longer fit. Standard attention " +
        "compares every token with every other, so its cost grows with the square of the sequence length, which is " +
        "one reason long contexts are expensive and why many optimisations target attention. Models also tend to use " +
        "information in a very long context less reliably than information near the start or end, so a bigger " +
        "window is not a guarantee that everything in it is used well.\n\n" +
        "The heatmap below uses weights written by hand to show the idea; they are illustrative and are not taken " +
        "from any real model. Real attention heads are messier, and any single head's pattern is only one small part " +
        "of how a model reaches an answer.";
}
