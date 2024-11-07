export class Problem {
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

export class ProblemConstructor {
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