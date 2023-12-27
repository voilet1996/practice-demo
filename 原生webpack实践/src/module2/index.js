import './index.less'
import _ from 'lodash'
let count = 0
const createElement = function () {
    const container = document.createElement('div')
    container.classList.add('container')
    const button = document.createElement('div')
    button.classList.add('btn')
    button.onclick = add
    const title = document.createElement('div')
    title.innerHTML = `count:${count}`
    const image = document.createElement('img')
    container.appendChild(button)
    container.appendChild(title)
    container.appendChild(image)
    document.body.appendChild(container)
}
const add = () => {
    count++
    console.log('count', count)
}

createElement()
