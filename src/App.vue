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

<script src="./script.js"></script>
