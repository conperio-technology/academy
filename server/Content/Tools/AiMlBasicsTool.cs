namespace DsaAcademy.Content.Tools;

public class AiMlBasicsTool : ITool
{
    public string Id => "ai-ml-basics";
    public string Section => "AI & Machine Learning";
    public string Track => "machine learning";
    public int Order => 10;
    public string Title => "Machine Learning Basics: Learning a Function from Examples";
    public string OneLiner => "Supervised, unsupervised and reinforcement learning, features and labels, training vs inference, and why a model that aces its training data can still be useless.";
    public string KeyTakeaway =>
        "Machine learning replaces hand-written rules with a function whose parameters are fitted to example data. " +
        "The goal is never to score well on the examples you trained on; it is to do well on data the model has not " +
        "seen. That is why you hold back validation and test data, and why a more flexible model is not automatically " +
        "a better one: past a point it starts memorising noise (overfitting).";

    public ToolKind ToolKind => ToolKind.AiMlBasics;

    public string Explanation =>
        "In ordinary programming you write the rules: if the motor current is above 12 A for 3 seconds, raise an " +
        "alarm. In machine learning (ML) you pick a family of functions with adjustable numbers in them, called " +
        "parameters or weights, and let an algorithm choose those numbers so the function fits a set of examples. " +
        "The inputs to the function are features (current, temperature, vibration level), and in supervised " +
        "learning each example also carries the right answer, its label (\"bearing failed within a week\" or not).\n\n" +
        "There are three broad kinds of learning. Supervised learning learns from labelled examples: classification " +
        "predicts a category (spam or not, defect or not) and regression predicts a number (remaining useful life " +
        "in hours). Unsupervised learning gets no labels and looks for structure on its own, such as clustering " +
        "similar machines together or flagging readings that do not look like the rest (anomaly detection). " +
        "Reinforcement learning has an agent take actions in an environment and receive a reward, and it learns a " +
        "policy that earns more reward over time; it is how game-playing systems are trained, and a version of it " +
        "is used to tune language models, as a later lesson shows. Many real systems mix these; large language " +
        "models, for example, are pretrained with a self-supervised objective where the labels come free from the " +
        "text itself (the next word).\n\n" +
        "Training is the expensive, one-off phase where the parameters are fitted. Inference is using the finished " +
        "model to make a prediction, which happens every time someone calls it. When you use an AI coding tool you " +
        "are only ever doing inference; nothing you type changes the model's weights in that moment.\n\n" +
        "The central danger is overfitting. A model with enough parameters can fit its training examples perfectly, " +
        "including their noise and quirks, and then fail on anything new. The opposite, underfitting, is a model too " +
        "simple to capture the real pattern. To tell them apart you split your data: a training set to fit the " +
        "parameters, a validation set to compare models and tune settings (hyperparameters such as the polynomial " +
        "degree below), and a test set you touch once at the end to estimate real-world performance. If you keep " +
        "tuning against the test set it quietly becomes another validation set and stops being an honest estimate. " +
        "Common splits are around 70/15/15 or 80/10/10, and the split must respect time and grouping: if the model " +
        "will predict next month's failures, validate on data from after the training period, not a random shuffle.\n\n" +
        "The demo fits polynomials to 12 noisy training points drawn from a smooth curve, then measures error on " +
        "separate validation points. Low degrees underfit. Around degree 3 to 5 both errors are low. Push the degree " +
        "up and training error keeps falling while validation error climbs: the curve bends wildly to pass through " +
        "every training point. Regularisation (penalising large weights) and more data are the usual cures. The data " +
        "is generated from a fixed seed, so the numbers are the same every time.";
}
