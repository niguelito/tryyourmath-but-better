import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'

MathJax.Hub.Config({
    tex2jax: {
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
        ],
    },
    messageStyle: 'none',
});

createApp(App).mount('#root')
