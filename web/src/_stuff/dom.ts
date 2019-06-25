import { isBoolean } from 'util'

export const valOf = (name: string) => {
  const selector = '[name="customer__' + name.toLowerCase() + '"]'
  const e = document.querySelector(selector) as HTMLInputElement
  return e === null || e.value === null ? '' : e.value
}
export const checkedOf = (name: string) => {
  const selector = '[name="customer__' + name.toLowerCase() + '"]'
  const e = document.querySelector(selector) as HTMLInputElement
  return e !== null && e.checked
}

export const initializeDom = (validateF: () => true | string[]) => {
  const panelClose = document.querySelector('.message-panel__close')
  if (panelClose) {
    panelClose.addEventListener('click', closeMessagePanel)
  }
  const submitButton = document.querySelector('.button__submit')
  if (submitButton === null) {
    return showException('submit button not found:(')
  }
  submitButton.addEventListener('click', () => onSubmitClick(validateF))
}

function showMessagePanel(text: string, type: string) {
  const messagePanel = document.querySelector('.message-panel')
  if (!messagePanel) {
    alert(text)
    return
  }
  const messagePanelText = document.querySelector('.message-panel__text')
  if (messagePanelText) {
    messagePanelText.innerHTML = text
  }
  messagePanel.classList.add('message-panel_' + type)
  messagePanel.classList.remove('section_hidden')
  const customerSection = document.querySelector('.customer')
  if (customerSection) {
    customerSection.classList.add('section_hidden')
  }
}

function closeMessagePanel() {
  const messagePanel = document.querySelector('.message-panel')
  if (!messagePanel) {
    return
  }
  messagePanel.classList.add('section_hidden')
  messagePanel.classList.remove('message-panel_error')
  messagePanel.classList.remove('message-panel_success')
  const messagePanelText = document.querySelector('.message-panel__text')
  if (messagePanelText) {
    messagePanelText.innerHTML = 'text'
  }
  const customerSection = document.querySelector('.customer')
  if (customerSection) {
    customerSection.classList.remove('section_hidden')
  }
}

function showSuccess(text: string) {
  showMessagePanel(text, 'success')
}

function showException(text: string) {
  showMessagePanel(text, 'error')
}

type SubmitResult = { success: true } | { success: false; message: string }

function onSubmitClick(validateF: () => true | string[]) {
  const validation = validateF()
  if (!isBoolean(validation)) {
    showErrors(validation)
    return
  }
  hideErrors()
  const form = document.querySelector('.form') as HTMLFormElement
  const params = new URLSearchParams()
  for (let e in form.elements) {
    const input = form.elements[e] as HTMLInputElement
    if (input.type === 'text') {
      params.append(input.name, input.value)
    }
    if (input.type === 'checkbox') {
      params.append(input.name, JSON.stringify(input.checked))
    }
  }
  fetch(form.action, {
    body: params,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  })
    .then(response =>
      response.text().then(txt => {
        const result = JSON.parse(txt) as SubmitResult
        if (result.success) {
          showSuccess('customer saved!')
        } else {
          showException(result.message)
        }
      })
    )
    .catch(e => showException(e))
}
function showErrors(errors: string[]) {
  const errorPanel = document.querySelector('.error')
  if (!errorPanel) {
    return
  }
  errorPanel.classList.remove('error_hidden')
  const errorList = document.querySelector('.error__list')
  if (!errorList) {
    return
  }
  errorList.innerHTML = errors
    .map(e => '<li class="error__item">' + e + '</li>')
    .join('')
}
function hideErrors() {
  const errorPanel = document.querySelector('.error')
  if (!errorPanel) {
    return
  }
  errorPanel.classList.add('error_hidden')
  const errorList = document.querySelector('.error__list')
  if (!errorList) {
    return
  }
  errorList.innerHTML = 'errors'
}
