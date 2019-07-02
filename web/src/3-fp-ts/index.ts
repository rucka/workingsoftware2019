import { emailREx, urlREx, vatcodeREx } from '../_stuff/regex-collection'
import { valOf, checkedOf } from '../_stuff/dom'
import { NonEmptyArray, of, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import * as _ from 'fp-ts/lib/Either'
import { sequenceT } from 'fp-ts/lib/Apply'
import { pipe } from 'fp-ts/lib/pipeable'
import { identity } from 'fp-ts/lib/function'

type Errors = NonEmptyArray<string>
type Validation<A> = _.Either<Errors, A>
const success = <A>(a: A) => _.right<Errors, A>(a)
const failure = <A>(e: Errors) => _.left<Errors, A>(e)

function validateName(name: string): Validation<string> {
  if (name === '') return failure(of('Name cannot be empty'))
  return name.length > 3
    ? success(name)
    : failure(
        of(`Name must be at least 3 chars long, actual is ${name.length}`)
      )
}
function validateEmail(email: string): Validation<string> {
  if (email === '') return failure(of('Email cannot be empty'))
  return emailREx.test(email)
    ? success(email)
    : failure(of(`Email address '${email}' is not valid`))
}
function validateVatCode(vatcode: string): Validation<string> {
  if (vatcode === '') return failure(of('VatCode cannot be empty'))
  return vatcodeREx.test(vatcode)
    ? success(vatcode)
    : failure(of(`VAT code '${vatcode}' is not valid`))
}
function validateUrl(url: string): Validation<string> {
  console.log(url)
  return url === null || url === '' || urlREx.test(url)
    ? success(url)
    : failure(of(`Url '${url}' is not valid`))
}
function validateAccept(accept: boolean): Validation<boolean> {
  return accept ? success(true) : failure(of(`Terms must be accepted`))
}

type Customer = {
  name: string
  email: string
  vatcode: string
  website: string
  accept: boolean
}

const buildCustomer = ([name, email, vatcode, website, accept]: [
  string,
  string,
  string,
  string,
  boolean
]) => ({ name, email, vatcode, website, accept })

const sequenceValidation = sequenceT(_.getValidation(getSemigroup<string>()))
export const processCustomer = () => {
  //https://ema.codiceplastico.com/2018/08/02/fp-validation.html <- "Fp-ts validation spiegata bene"
  //https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja <- Getting started with fp-ts: Either vs Validation

  const nameValidated: Validation<string> = validateName(valOf('Name'))
  const emailValidated: Validation<string> = validateEmail(valOf('Email'))
  const vatcodeValidated: Validation<string> = validateVatCode(valOf('VATCode'))
  const urlValidated: Validation<string> = validateUrl(valOf('Website'))
  const acceptValidated: Validation<boolean> = validateAccept(
    checkedOf('Accept')
  )
  const customerValidated = pipe(
    sequenceValidation(
      nameValidated,
      emailValidated,
      vatcodeValidated,
      urlValidated,
      acceptValidated
    ),
    _.map(buildCustomer)
  )

  pipe(
    customerValidated,
    _.map<Customer, string>(c => `${c.name}(${c.email})`),
    _.fold(
      () => console.error('opss... something goes wrong!'),
      t => alert(`I'm ${t}!`)
    )
  )

  return _.fold<Errors, Customer, true | string[]>(identity, () => true)(
    customerValidated
  )
}
