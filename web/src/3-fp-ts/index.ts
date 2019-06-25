import { emailREx, urlREx, vatcodeREx } from '../_stuff/regex-collection'
import { valOf, checkedOf } from '../_stuff/dom'
import {
  Validation,
  success,
  failure,
  getApplicative
} from 'fp-ts/lib/Validation'
import { liftA5 } from './liftA5'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
const A = getApplicative(getSemigroup<string>())

function validateName(name: string): Validation<NonEmptyArray<string>, string> {
  if (name === '') return failure(new NonEmptyArray('Name cannot be empty', []))
  return name.length > 3
    ? success(name)
    : failure(
        new NonEmptyArray(
          `Name must be at least 3 chars long, actual is ${name.length}`,
          []
        )
      )
}
function validateEmail(
  email: string
): Validation<NonEmptyArray<string>, string> {
  if (email === '')
    return failure(new NonEmptyArray('Email cannot be empty', []))
  return emailREx.test(email)
    ? success(email)
    : failure(new NonEmptyArray(`Email address '${email}' is not valid`, []))
}
function validateVatCode(
  vatcode: string
): Validation<NonEmptyArray<string>, string> {
  if (vatcode === '')
    return failure(new NonEmptyArray('VatCode cannot be empty', []))
  return vatcodeREx.test(vatcode)
    ? success(vatcode)
    : failure(new NonEmptyArray(`VAT code '${vatcode}' is not valid`, []))
}
function validateUrl(url: string): Validation<NonEmptyArray<string>, string> {
  console.log(url)
  return url === null || url === '' || urlREx.test(url)
    ? success(url)
    : failure(new NonEmptyArray(`Url '${url}' is not valid`, []))
}
function validateAccept(
  accept: boolean
): Validation<NonEmptyArray<string>, boolean> {
  return accept
    ? success(true)
    : failure(new NonEmptyArray(`Terms must be accepted`, []))
}

type Customer = {
  name: string
  email: string
  vatcode: string
  website: string
  accept: boolean
}
const makeCustomer = (name: string) => (email: string) => (vatcode: string) => (
  website: string
) => (accept: boolean) => {
  return {
    name,
    email,
    vatcode,
    website,
    accept
  } as Customer
}

export const processCustomer = () => {
  //https://ema.codiceplastico.com/2018/08/02/fp-validation.html <- "Fp-ts validation spiegata bene"

  const nameValidated: Validation<NonEmptyArray<string>, string> = validateName(
    valOf('Name')
  )
  const emailValidated: Validation<
    NonEmptyArray<string>,
    string
  > = validateEmail(valOf('Email'))

  const vatcodeValidated: Validation<
    NonEmptyArray<string>,
    string
  > = validateVatCode(valOf('VATCode'))

  const urlValidated: Validation<NonEmptyArray<string>, string> = validateUrl(
    valOf('Website')
  )
  const acceptValidated: Validation<
    NonEmptyArray<string>,
    boolean
  > = validateAccept(checkedOf('Accept'))
  const liftACustomer = liftA5(A)(makeCustomer)
  const customerValidated = liftACustomer(nameValidated)(emailValidated)(
    vatcodeValidated
  )(urlValidated)(acceptValidated)

  const text = customerValidated.map(c => `${c.name}(${c.email})`)
  text.map(t => alert(`I'm ${t}!`))

  return customerValidated.fold<string[] | boolean>(
    e => e.toArray(),
    _ => true
  ) as (true | string[])
}
