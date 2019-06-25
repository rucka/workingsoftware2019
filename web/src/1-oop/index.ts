import { emailREx, urlREx, vatcodeREx } from '../_stuff/regex-collection'
import { valOf, checkedOf } from '../_stuff/dom'

const validateEmail = (email: string) => emailREx.test(email)
const validateVatCode = (vatcode: string) => vatcodeREx.test(vatcode)
const validateUrl = (url: string) => urlREx.test(url)

class Customer {
  constructor(
    readonly name: string,
    readonly email: string,
    readonly website: string,
    readonly vatcode: string,
    readonly accepted: boolean
  ) {}
  isValid() {
    return this.validate().length === 0
  }
  validate() {
    const errors: string[] = []
    if (this.name === '') {
      errors.push('name must be filled')
    }
    if (this.vatcode === '') {
      errors.push('vat code must be filled')
    }
    if (this.email === '') {
      errors.push('email must be filled')
    }
    if (!this.accepted) {
      errors.push('terms must be accepted')
    }
    if (this.email !== '' && !validateEmail(this.email)) {
      errors.push('email is not valid')
    }
    if (this.vatcode !== '' && !validateVatCode(this.vatcode)) {
      errors.push('vatcode is not valid')
    }
    if (this.website !== '' && !validateUrl(this.website)) {
      errors.push('website is not valid')
    }
    return errors
  }
}

function getCustomer() {
  const name = valOf('Name')
  const email = valOf('Email')
  const vatcode = valOf('VATCode')
  const website = valOf('Website')
  const accepted = checkedOf('Accept')
  return new Customer(name, email, website, vatcode, accepted)
}

export const processCustomer = () => {
  const customer = getCustomer()
  if (customer.isValid()) {
    return true
  } else {
    return customer.validate()
  }
}
