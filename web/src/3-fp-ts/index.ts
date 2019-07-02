import { emailREx, urlREx, vatcodeREx } from '../_stuff/regex-collection'
import { valOf, checkedOf } from '../_stuff/dom'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import * as _ from 'fp-ts/lib/Either'
import { sequenceT } from 'fp-ts/lib/Apply'
import { pipe } from 'fp-ts/lib/pipeable'
import { identity } from 'fp-ts/lib/function'

const sequenceValidation = sequenceT(_.getValidation(getSemigroup<string>()))

type Errors = NonEmptyArray<string>
type Validation<A> = _.Either<Errors, A>

function lift<E, A>(
  check: (a: A) => _.Either<E, A>
): (a: A) => _.Either<NonEmptyArray<E>, A> {
  return a =>
    pipe(
      check(a),
      _.mapLeft(a => [a])
    )
}

const notEmpty = (field: string) => (s: string): _.Either<string, string> =>
  s && s.length > 0 ? _.right(s) : _.left(`${field} cannot be null`)

const minLength = (field: string, chars: number) => (
  s: string
): _.Either<string, string> =>
  s.length >= chars
    ? _.right(s)
    : _.left(
        `${field} must be at least ${chars} chars long, actual is ${s.length}`
      )

const emailValid = (s: string): _.Either<string, string> =>
  emailREx.test(s) ? _.right(s) : _.left(`url '${s}' is not valid`)

const vatCodeValid = (s: string): _.Either<string, string> =>
  vatcodeREx.test(s) ? _.right(s) : _.left(`VAT code '${s}' is not valid`)

const urlValid = (s: string): _.Either<string, string> =>
  urlREx.test(s) ? _.right(s) : _.left(`url '${s}' is not valid`)

const termsIsValid = (b: boolean): _.Either<string, boolean> =>
  b ? _.right(b) : _.left(`Terms must be accepted`)

function validateName(name: string): Validation<string> {
  return pipe(
    sequenceValidation(
      lift(notEmpty('Name'))(name),
      lift(minLength('Name', 3))(name)
    ),
    _.map(() => name)
  )
}
function validateEmail(email: string): Validation<string> {
  return pipe(
    sequenceValidation(lift(notEmpty('Email'))(email), lift(emailValid)(email)),
    _.map(() => email)
  )
}
function validateVatCode(vatcode: string): Validation<string> {
  return pipe(
    sequenceValidation(
      lift(notEmpty('Vatcode'))(vatcode),
      lift(vatCodeValid)(vatcode)
    ),
    _.map(() => vatcode)
  )
}
function validateUrl(url: string): Validation<string> {
  if (url === null || url === undefined || url === '') return _.right(url)
  return lift(urlValid)(url)
}
function validateAccept(accept: boolean): Validation<boolean> {
  return lift(termsIsValid)(accept)
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
    _.fold(() => {}, t => alert(`I'm ${t}!`))
  )

  return _.fold<Errors, Customer, true | string[]>(identity, () => true)(
    customerValidated
  )
}
