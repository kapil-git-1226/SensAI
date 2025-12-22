import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Trophy, XCircle } from "lucide-react";

const QuizResult = ({ result, hideStartNew = false, onStartNew }) => {

    if (!result) return null;

    return (
        <div className="w-full">
            <h1 className="flex items-center gap-2 text-3xl gradient-title mb-6">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Quiz Results
            </h1>

            <div className="space-y-6">
                {/* Score Overview - Full Width */}
                <div className="text-center space-y-3">
                    <p className="text-4xl font-bold">{result.quizScore.toFixed(1)}%</p>
                    <Progress value={result.quizScore} className="w-full" />
                </div>

                {/* Improvement tip - Full Width */}
                {result.improvementTip && (
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium mb-2">Improvement Tip:</p>
                        <p className="text-sm text-muted-foreground">{result.improvementTip}</p>
                    </div>
                )}

                {/* Question Review - Vertical Stack */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Question Review</h3>
                    {result.questions.map((q, index) => (
                        <div className="border rounded-lg p-4 space-y-3" key={index}>
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium">{q.question}</p>
                                {q.isCorrect ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                )}
                            </div>

                            <div className="text-sm space-y-1">
                                <p className="text-muted-foreground"><span className="font-medium">Your answer:</span> {q.userAnswer}</p>
                                {!q.isCorrect && <p className="text-muted-foreground"><span className="font-medium">Correct answer:</span> {q.answer}</p>}
                            </div>
                            <div className="text-sm bg-muted p-3 rounded">
                                <p className="font-medium mb-1">Explanation:</p>
                                <p className="text-muted-foreground">{q.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!hideStartNew && (
                <CardFooter>
                    <Button onClick={onStartNew} className="w-full">
                        Start New Quiz
                    </Button>
                </CardFooter>
            )}
        </div>
    )
}

export default QuizResult