<template>
  <div id="app-container">
    <div id="app">
      <h1>Try Your Math</h1>
      <p>But Better</p>

      <div id="question" v-if="hasStarted">
        <h3 id="problem-display" v-if="!hideProblem">
          {{ currentProblem.toMathjax() }}
        </h3>

        <div id="answers">
          <button
            v-for="(answer, i) in currentProblem.answers"
            :key="i"
            @click="checkAnswer(i)"
            class="option-button"
          >
            {{ answer }}
          </button>
        </div>

        <div id="score">
          <p>Remaining Time: {{ formatTime(currentTime) }}</p>
          <p>Score: {{ currentScore }}</p>

          <button @click="endGame">End Game</button>
        </div>
      </div>

      <div id="summary" v-else-if="showResults && results != null">
        <h2>Summary</h2>

        <p>Time: {{ formatTime(parseInt(timer)) }}</p>
        <p>Questions Answered: {{ results.questions }}</p>
        <br />
        <p>Total Correct: {{ results.correct }}</p>
        <p>Total Incorrect: {{ results.incorrect }}</p>
        <p>Total Penalty: -{{ formatTime(results.calculatePenalty()) }}</p>
        <p>Score: {{ results.calculatePercentage() }}%</p>

        <button
          @click="
            showResults = false;
            results = null;
          "
        >
          Continue
        </button>
      </div>

      <div id="difficulty" v-else>
        <h3>Choose Difficulty</h3>

        <select v-model="difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select v-model="timer">
          <option value="10">10 Seconds</option>
          <option value="30">30 Seconds</option>
          <option value="60">1 Minute</option>
          <option value="120">2 Minutes</option>
          <option value="300">5 Minutes</option>
          <option value="600">10 Minutes</option>
        </select>

        <br /><br />

        <button @click="startGame()">Start Game!</button>

        <p>Best Score: {{ bestScore }}</p>
        <p>Previous Score: {{ oldScore }}</p>
      </div>
    </div>
  </div>
</template>

<script>
MathJax.Hub.Config({
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
  },
  messageStyle: 'none',
});

const TIME_PENALTY = 5;

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

        audio = new Audio(
          'https://www.myinstants.com/media/sounds/correct.mp3'
        );
      } else {
        this.currentTime -= TIME_PENALTY;
        this.results.answerQuestion(false);

        audio = new Audio(
          'https://www.myinstants.com/media/sounds/answer-wrong.mp3'
        );
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

class Problem {
  constructor(problem, answers, correctAnswer) {
    this.problem = problem;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
  }

  toMathjax() {
    return `\\(${this.problem
      .split('*')
      .join('\\times')
      .split('/')
      .join('\\div')} \\)`;
  }

  toString() {
    return this.problem;
  }
}

class ProblemConstructor {
  constructor(difficulty) {
    this.difficulty = difficulty;
  }

  getOperations() {
    const operations = ['+', '-'];

    if (this.difficulty == 'medium') {
      operations.push('*');
    }

    if (this.difficulty == 'hard') {
      operations.push('*');
      operations.push('/');
    }

    return operations;
  }

  getMultiplier() {
    if (this.difficulty == 'easy') {
      return 10;
    } else if (this.difficulty == 'medium') {
      return 50;
    } else if (this.difficulty == 'hard') {
      return 100;
    }
  }

  getConstraints() {
    if (this.difficulty == 'easy') {
      return (num) => {
        return num >= 0 && num <= 50;
      };
    } else if (this.difficulty == 'medium') {
      return (num) => {
        return num >= -25 && num <= 250;
      };
    } else if (this.difficulty == 'hard') {
      return (num) => {
        return num >= -50 && num <= 500;
      };
    }
  }

  getNumberConstraints() {
    if (this.difficulty == 'easy') {
      return (num) => {
        return (num <= 0) | (num >= 1);
      };
    } else if (this.difficulty == 'medium') {
      return (num) => {
        return num <= -5 || num >= 5;
      };
    } else if (this.difficulty == 'hard') {
      return (num) => {
        return num <= -10 || num >= 10;
      };
    }
  }

  createProblem() {
    const operations = this.getOperations();
    const operation = operations[Math.floor(Math.random() * operations.length)];

    return this.createProblemOperation(operation);
  }

  createProblemOperation(operation) {
    const first = Math.round(Math.random() * this.getMultiplier());
    const second = Math.round(Math.random() * this.getMultiplier());

    const constraints = this.getNumberConstraints();
    if (!(constraints(first) && constraints(second))) {
      return this.createProblemOperation(operation);
    }

    const problem = `${first} ${operation} ${second}`;
    const answer = eval(problem);
    const options = this.genOptions(answer);
    const correctAnswer = options.indexOf(answer);

    if (answer % 1 != 0) {
      return this.createProblemOperation(operation);
    }

    if (!this.getConstraints()(answer)) {
      return this.createProblemOperation(operation);
    }

    return new Problem(problem + ' =', options, correctAnswer);
  }

  genOption(num, num2) {
    let a = 0;

    if (Math.random() > 0.5) {
      a = num + Math.round(Math.random() * 10);
    } else {
      a = num - Math.round(Math.random() * 10);
    }

    if (a == num) {
      return this.genOption(num, num2);
    }

    if (a == num2) {
      return this.genOption(num, num2);
    }

    return a;
  }

  genOptions(answer) {
    const f = this.genOption(answer, -4959834);

    let options = [f, this.genOption(answer, f), answer];

    options = options.sort(() => Math.random() - 0.5);

    return options;
  }
}
</script>

<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->
<style>
html {
  width: 100vw;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  background-image: url('https://wallpapercave.com/wp/wp2555020.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

#app-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  width: 50%;
  margin: 0 auto;
  padding: 20px;
  backdrop-filter: blur(25px);
  border: 3px solid rgba(50, 50, 50, 0.4);
  display: inline-block;
}

h1 {
  font-size: 36px;
}

#question {
  font-size: 24px;
  margin-bottom: 20px;
}

#options {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.option-button {
  margin: 3px;
  padding: 15px;
  border: none;
  background-color: rgba(16, 186, 0, 0.4);
  color: #000;
  border-radius: 8px;
  width: 90%;
}

#timer {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

#score {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

select {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  font-size: 1.2em;
}

button {
  padding: 15px;
  font-size: 20px;
  cursor: pointer;
  border: none;
  background-color: rgba(0, 102, 255, 0.3);
  color: #fff;
  border-radius: 8px;
  transition: 0.3s ease;
}

button:hover {
  transform: scale(1.1);
}
</style>
