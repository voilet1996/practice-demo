import './index.less'
import backgroundImg from '../images/2.png'
import { add } from '../common'
import _ from 'lodash'
window.count = 0

const createElement = function () {
    const container = document.createElement('div')
    container.classList.add('container')
    const button = document.createElement('div')
    button.classList.add('btn')
    button.onclick = add
    const title = document.createElement('div')
    title.innerHTML = `count:${window.count}`
    const image = document.createElement('img')
    // image.src = './images/1.png'
    image.src = backgroundImg
    container.appendChild(button)
    container.appendChild(title)
    container.appendChild(image)
    document.body.appendChild(container)
}

createElement()
