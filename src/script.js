import { onMounted } from "vue";
import { Problem, ProblemConstructor } from "./ProblemGenerator.js"

const TIME_PENALTY = 5;
const CORRECT_AUDIO = new Audio("./correct.mp3");
const INCORRECT_AUDIO = new Audio("./answer-wrong.mp3")

var dataName = "141a43fetryyourmath";

class GameResults {
    constructor(questions, correct) {
        this.questions = questions;
        this.correct = correct;
        this.incorrect = questions - correct;
    }

    answerQuestion(bl) {
        this.questions++;
        if (bl) {
            this.correct++;
        } else {
            this.incorrect++;
        }
    }

    calculatePercentage() {
        return Math.round((this.correct / this.questions) * 100);
    }

    calculatePenalty() {
        return this.incorrect * TIME_PENALTY;
    }
}

export default {
    data() {
        return {
            difficulty: 'easy',
            timer: '60',

            hasStarted: false,
            showResults: false,
            results: null,

            currentProblem: null,
            hideProblem: false,

            bestScore: 0,
            oldScore: 0,

            currentScore: 0,
            currentTime: 0,
            interval: 0,
        };
    },
    mounted() {
        var data = localStorage.getItem(dataName);
        if (data) {
            var stuff = JSON.parse(data);

            this.bestScore = stuff['bestScore'] ? stuff.bestScore : 0;
            this.oldScore = stuff['oldScore'] ? stuff.oldScore : 0;
        }
    },
    methods: {
        formatTime(given_seconds) {
            const dateObj = new Date(given_seconds * 1000);
            const minutes = dateObj.getUTCMinutes();
            const seconds = dateObj.getSeconds();

            const timeString =
                minutes.toString().padStart(2, '0') +
                ':' +
                seconds.toString().padStart(2, '0');

            return timeString;
        },

        startGame() {
            this.hasStarted = true;

            this.currentProblem = new ProblemConstructor(
                this.difficulty
            ).createProblem();

            this.startTimer();

            this.results = new GameResults(0, 0);

            this.updateMathjax();
        },

        endGame() {
            this.hasStarted = false;

            this.stopTimer();

            this.bestScore = Math.max(this.bestScore, this.currentScore);
            this.oldScore = this.currentScore;

            localStorage.setItem(dataName, JSON.stringify({bestScore: this.bestScore, oldScore: this.oldScore}))

            this.currentScore = 0;

            this.showResults = true;
        },

        checkAnswer(i) {
            let audio;

            if (
                this.currentProblem.answers[i] ==
                this.currentProblem.answers[this.currentProblem.correctAnswer]
            ) {
                this.currentScore++;
                this.results.answerQuestion(true);

                audio = CORRECT_AUDIO;
            } else {
                this.currentTime -= TIME_PENALTY;
                this.results.answerQuestion(false);

                audio = INCORRECT_AUDIO;
            }

            audio.play();

            this.currentProblem = new ProblemConstructor(
                this.difficulty
            ).createProblem();

            this.checkTimer();

            this.updateMathjax();
        },

        updateMathjax() {
            this.hideProblem = true;
            setTimeout(() => {
                this.hideProblem = false;

                this.$nextTick(() => {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
                });
            }, 10);
        },

        startTimer() {
            this.currentTime = parseInt(this.timer);
            this.interval = setInterval(() => {
                this.currentTime -= 1;

                this.checkTimer();
            }, 1000);
        },

        checkTimer() {
            if (this.currentTime <= 0) {
                this.endGame();
            }
        },

        stopTimer() {
            clearInterval(this.interval);
        },
    },
};