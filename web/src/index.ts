import './style.css'
import { initializeDom } from './_stuff/dom'
import { processCustomer } from './1-oop'
//import { processCustomer } from './2-vanillafp'
//import { processCustomer } from './3-fp-ts'

fetch('http://localhost:3333/')
  .then(res => res.text())
  .then(txt => {
    const element = document.querySelector('.title')
    if (element !== null) {
      element.innerHTML = txt
    }
  })

initializeDom(processCustomer)
