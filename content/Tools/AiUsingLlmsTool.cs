namespace DsaAcademy.Content.Tools;

public class AiUsingLlmsTool : ITool
{
    public string Id => "ai-using-llms";
    public string Section => "AI & Machine Learning";
    public string Track => "using AI";
    public int Order => 60;
    public string Title => "Using LLMs Well: Sampling, Prompting, Tools and RAG";
    public string OneLiner => "What temperature and top-p really do, how to write prompts that work, structured output, tool use and agents, retrieval-augmented generation, and how to tell whether any of it is working.";
    public string KeyTakeaway =>
        "Output is sampled from a probability distribution, so temperature and top-p trade predictability for " +
        "variety. Clear instructions, examples and a defined output format get far more out of a model than clever " +
        "wording. Tools and retrieval let a model act on and cite real data instead of relying on memory, and the " +
        "only way to know a prompt or pipeline works is to evaluate it on a fixed set of real cases.";

    public ToolKind ToolKind => ToolKind.AiUsingLlms;

    public string Explanation =>
        "Sampling. At each step the model produces a probability for every token in its vocabulary, and something " +
        "has to choose one. Greedy decoding always picks the most likely token. Temperature divides the model's raw " +
        "scores (logits) before softmax: below 1 sharpens the distribution towards the top choice, above 1 flattens " +
        "it so unlikely tokens get picked more. Top-p (nucleus) sampling keeps only the smallest set of tokens whose " +
        "probabilities add up to p and renormalises; top-k keeps the k most likely. Low temperature suits code, " +
        "extraction and classification; higher suits brainstorming. Even at temperature 0, outputs are not always " +
        "bit-for-bit identical in practice, because of how requests are batched and computed on the provider's side, " +
        "so do not build anything that depends on exact repeatability.\n\n" +
        "Prompting. Treat the model like a capable new colleague with no context. Say what you want, who it is for, " +
        "what good looks like and what to avoid, and give the relevant material rather than assuming it knows your " +
        "codebase. A system prompt is the standing instruction set by the application (role, rules, format) that " +
        "applies to the whole conversation. Few-shot prompting includes a few worked input and output examples, " +
        "which is often the fastest way to pin down a format. Asking for step-by-step reasoning before the final " +
        "answer can help on multi-step problems; many current models do this internally. For machine-readable " +
        "results, ask for JSON matching a schema, and where the API supports structured output or constrained " +
        "decoding, use it; either way, validate what comes back.\n\n" +
        "Tools and agents. With tool use (function calling) you describe functions to the model, such as " +
        "search_tickets(query) or run_tests(); the model replies with a request to call one and its arguments, " +
        "your code runs it and sends back the result, and the model continues. The model never executes anything " +
        "itself. An agent is that loop repeated: the model plans, calls tools, reads results and decides the next " +
        "step until the task is done. AI coding assistants are agents whose tools read files, edit them and run " +
        "commands. Agents are powerful and also compound errors, so give them narrow tools, limits and checkpoints.\n\n" +
        "RAG. Retrieval-augmented generation answers questions from your own documents. Ahead of time, split the " +
        "documents into chunks (a few hundred tokens, often with some overlap), embed each chunk and store the " +
        "vectors in a vector index. At question time, embed the question, retrieve the most similar chunks, put them " +
        "in the prompt and instruct the model to answer only from them and cite which chunk it used. This grounds " +
        "answers in current, private data without retraining, but the answer can only be as good as retrieval: wrong " +
        "chunks in, wrong answer out. Many systems combine vector search with keyword search and a re-ranking step.\n\n" +
        "Evaluation. Before trusting a prompt, a model choice or a RAG pipeline, build an evaluation set: real " +
        "inputs with known good outputs or clear pass criteria. Score automatically where you can (exact match, " +
        "tests pass, JSON validates), use a rubric or a second model as a grader where you cannot, and spot-check " +
        "by hand. Re-run it whenever you change the prompt or the model; a change that fixes one example often " +
        "breaks another.\n\n" +
        "The sampling demo uses a made-up distribution for the word after \"The conveyor stopped because the\". The " +
        "RAG demo scores chunks by word overlap, a stand-in for real embeddings so you can see why each chunk " +
        "matched; real systems use embedding similarity, which also matches synonyms and paraphrases.";
}
