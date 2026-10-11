namespace DsaAcademy.Content.Tools;

public class AiLlmTrainingTool : ITool
{
    public string Id => "ai-llm-training";
    public string Section => "AI & Machine Learning";
    public string Track => "language models";
    public int Order => 50;
    public string Title => "How an LLM Is Trained: Pretraining, Fine-Tuning and RLHF";
    public string OneLiner => "From a pile of text to a helpful assistant in stages: next-token pretraining at scale, supervised instruction tuning, and preference training, plus why the result still makes things up.";
    public string KeyTakeaway =>
        "Pretraining teaches a model to continue text by predicting the next token over a huge corpus; that is where " +
        "nearly all its knowledge and skill comes from, and almost all the compute goes. Instruction tuning on " +
        "example conversations and preference training (such as RLHF) then shape that base model into an assistant " +
        "that follows instructions and declines harmful requests. None of these stages teaches the model to know " +
        "what it does not know, so it can produce fluent, confident text that is false.";

    public ToolKind ToolKind => ToolKind.AiLlmTraining;

    public string Explanation =>
        "Stage one is pretraining. The model reads an enormous amount of text (web pages, books, code, papers, " +
        "typically filtered and de-duplicated) and at every position predicts the next token. The cross-entropy " +
        "loss compares its predicted probabilities with the token that actually came next, and gradient descent " +
        "adjusts the weights. No one labels anything; the text is its own answer key, which is why this is called " +
        "self-supervised. To get good at predicting the next token across that much text, the model has to pick up " +
        "grammar, facts, styles, coding conventions and some reasoning patterns. Research on scaling laws found that " +
        "loss falls fairly predictably as parameters, data and compute grow together, which is why frontier models " +
        "are trained on thousands of accelerators for weeks or months. The result is a base model: an excellent " +
        "autocomplete that will happily continue a question with more questions rather than answer it.\n\n" +
        "Stage two is supervised fine-tuning (SFT), often called instruction tuning. The base model is trained " +
        "further, the same way, on a much smaller set of high-quality example conversations: a user request and a " +
        "good assistant reply, written or checked by people (and increasingly generated with model help). The model " +
        "learns the format and tone of an assistant. Fine-tuning in general means continuing to train an existing " +
        "model on narrower data; cheaper parameter-efficient methods such as LoRA train small add-on matrices " +
        "instead of every weight.\n\n" +
        "Stage three is preference training. People (or a model guided by written principles) compare two replies " +
        "to the same prompt and pick the better one. In RLHF, reinforcement learning from human feedback, those " +
        "comparisons train a reward model that scores replies, and the language model is then optimised with " +
        "reinforcement learning to earn higher scores while being kept from drifting too far from the SFT model. " +
        "Direct preference optimisation (DPO) and similar methods learn from the comparisons without a separate " +
        "reward model. This stage is where helpfulness, honesty and harmlessness are shaped, and where models learn " +
        "to refuse some requests. Recent reasoning-focused models also get reinforcement learning on tasks with " +
        "checkable answers, such as maths and code with tests. Exact recipes differ between labs and change often; " +
        "this is the general shape, not any one vendor's pipeline.\n\n" +
        "Why models hallucinate: the training objective rewards plausible continuations, not true ones. When the " +
        "training data contained a fact many times the plausible continuation is usually correct, but for rare " +
        "facts, recent events after the training cutoff, exact citations, version numbers or API signatures, the " +
        "most plausible-sounding text can simply be wrong, and the model has no built-in signal that it is " +
        "guessing. Preference training can make this better (rewarding \"I'm not sure\") or worse (rewarding " +
        "confident, complete-sounding answers). Grounding the model in retrieved documents, asking for sources you " +
        "then check, and verifying code by running it are the practical defences.\n\n" +
        "The demo trains the smallest possible language model, a bigram model that only counts which word follows " +
        "which, on a few sentences. It is nothing like a transformer in capability, but the objective is the same " +
        "idea, next-token prediction, and you can watch it produce fluent-looking sentences that were never in its " +
        "training text, some of them false.";
}
