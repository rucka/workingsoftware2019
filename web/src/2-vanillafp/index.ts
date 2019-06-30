import { emailREx, urlREx, vatcodeREx } from '../_stuff/regex-collection'
import { valOf, checkedOf } from '../_stuff/dom'

type NameIsEmpty = { kind: 'NameIsEmpty' }
type NameIsTooShort = { kind: 'NameIsTooShort', name: string }
type VatCodeIsEmpty = { kind: 'VatCodeIsEmpty' }
type VatCodeNotValid = { kind: 'VatCodeNotValid', vatcode: string }
type EmailIsEmpty = { kind: 'EmailIsEmpty' }
type EmailIsNotValid = { kind: 'EmailIsNotValid', email: string }
type TermsNotAccepted = { kind: 'TermsNotAccepted' }
type WebsiteUrlNotValid = { kind: 'WebsiteUrlNotValid',  url: string }

function validateName(name: string): string | NameIsEmpty | NameIsTooShort {
  if (name === '') return { kind: 'NameIsEmpty' }
  return name.length > 3 ? name : { kind: 'NameIsTooShort', name: name }
}
function validateEmail(email: string): string | EmailIsEmpty | EmailIsNotValid {
  if (email === '') return { kind: 'EmailIsEmpty' }
  return emailREx.test(email) ? email : { kind: 'EmailIsNotValid', email: email }
}
function validateVatCode(vatCode: string): string | VatCodeIsEmpty | VatCodeNotValid {
  if (vatCode === '') return { kind: 'VatCodeIsEmpty' }
  return vatcodeREx.test(vatCode) ? vatCode : { kind: 'VatCodeNotValid', vatcode: vatCode }
}
function validateUrl(url: string): string | WebsiteUrlNotValid {
  return url === '' || urlREx.test(url) ? url : { kind: 'WebsiteUrlNotValid', url: url }
}
function validateAccept(accept: boolean): boolean | TermsNotAccepted {
  return accept ? true : { kind: 'TermsNotAccepted' }
}

type Customer = {
  name: string
  email: string
  vatCode: string
  website: string
  accepted: boolean
}

function buildCustomer(
  name: string,
  email: string,
  vatCode: string,
  website: string,
  accepted: boolean
): Customer {
  return {
    name: name,
    email: email,
    vatCode: vatCode,
    website: website,
    accepted: accepted
  }
}

type CustomerError =
  | NameIsEmpty
  | NameIsTooShort
  | VatCodeIsEmpty
  | VatCodeNotValid
  | EmailIsEmpty
  | EmailIsNotValid
  | WebsiteUrlNotValid
  | TermsNotAccepted

const errorMessage = (e: CustomerError) => {
  switch (e.kind) {
    case 'NameIsEmpty': return 'Name cannot be empty'
    case 'NameIsTooShort': return `Name must be at least 3 chars long, actual is ${e.name.length}`
    case 'EmailIsEmpty': return 'Email cannot be empty'
    case 'EmailIsNotValid': return `Email address '${e.email}' is not valid`
    case 'VatCodeIsEmpty': return 'VAT code cannot be empty'
    case 'VatCodeNotValid': return `VAT code '${e.vatcode}' is not valid`
    case 'WebsiteUrlNotValid': return `Url '${e.url}' is not valid`
    case 'TermsNotAccepted': return 'Terms must be accepted'
  }
}

/*****************************VALIDATION*************************************************/
//Validation can hold either a success value or a failure value (i.e. an error message or some other failure) and has methods for accumulating errors. We will represent a Validation like this: Validation<E,A> where E represents the error type and A represents the success type.

import { Validated, Validation, Valid, Invalid, isValid } from './effects/validation'
const saveCustomer = (_customer: Valid<Customer>): true => true
const showErrors = (data: Invalid<CustomerError>) => data.errors.map(e => errorMessage(e))

export const processCustomer = () => {
  /* //uncomment to see how the functional rule "A customer could be saved only if it's valid" is enforced by the compiler (a customer type cannot be saved)
  const notValidatedCustomer = buildCustomer(valOf('Name'), valOf('Email'), valOf('VATCode'), valOf('Website'), checkedOf('Accept'));
  saveCustomer(notValidatedCustomer);
  */
  const nameValidated: Validated<CustomerError, string> = Validation.lift<CustomerError, string>(valOf('Name'), validateName)
  const emailValidated = Validation.lift<CustomerError, string>(valOf('Email'),validateEmail)
  const vatcodeValidated = Validation.lift<CustomerError, string>(valOf('VATCode'), validateVatCode)
  const websiteValidated = Validation.lift<CustomerError, string>(valOf('Website'), validateUrl)
  const acceptValidated: Validated<CustomerError, boolean> = Validation.lift<CustomerError, boolean>(checkedOf('Accept'), validateAccept)

  const validatedCustomer: Validated<CustomerError, Customer> = Validation.liftA5(
    nameValidated,
    emailValidated,
    vatcodeValidated,
    websiteValidated,
    acceptValidated,
    buildCustomer
  )

  const text: Validated<CustomerError, string> = Validation.map(validatedCustomer, c => `${c.name}(${c.email})`)
  Validation.foreach(text, t => alert(`I'm ${t}!`))

  if (isValid(validatedCustomer)) {
    return saveCustomer(validatedCustomer) //<--- here validatedCustomer is Valid<Customer>
  } else {
    return showErrors(validatedCustomer)   //<--- here validatedCustomer is Invalid<CustomerError>
  }
}





























  // if (isValid(nameValidated)) {
  //   if (isValid(emailValidated)) {
  //     if (isValid(vatcodeValidated)) {
  //       if (isValid(websiteValidated)) {
  //         if (isValid(acceptValidated)) {
  //           const validCustomer = buildCustomer(nameValidated.a, emailValidated.a, vatcodeValidated.a, websiteValidated.a, acceptValidated.a);
  //           Validation.lift<CustomerError, Customer> (validCustomer, ....);
  //         } else {
  //           mergeErrors(errors, acceptValidated.errors);
  //         } 
  //       } else {
  //         mergeErrors(errors, websiteValidated.errors);
  //       }
  //     } else {
  //       mergeErrors(errors, vatcodeValidated.errors);
  //     }
  //   }else {
  //     mergeErrors(errors, emailValidated.errors);
  //   }
  // }else {
  //   mergeErrors(errors, nameValidated.errors);
  // }


/*****************************OPTION*************************************************/
//getting rid of null values providing our own type for representing optional values, i.e. values that may be present or not: the Option<A>
import {Option, Optional, Some, None, isSome} from "./effects/optional"

export const processCustomer_option = () => {
  const nameOptional: Option<string> = Optional.lift<string>(valOf('Name'))
  const emailOptional = Optional.lift<string>(valOf('Email'))
  const vatcodeOptional = Optional.lift<string>(valOf('VATCode'))
  const websiteOptional = Optional.lift<string>(valOf('Website'));
  const acceptOptional: Option<boolean> = Optional.lift<boolean>(checkedOf('Accept'))

  const optionalCustomer: Option<Customer> = Optional.liftA5(
      nameOptional,
      emailOptional,
      vatcodeOptional,
      websiteOptional,
      acceptOptional,
      buildCustomer);

  const text: Option<string> = Optional.map(optionalCustomer, c => `${c.name}(${c.email})`)
  Optional.foreach(text, t => alert(`I'm ${t}!`));

  const saveCustomer = (_: Some<Customer>): true => true
  const showErrors = (_: None) => ["customer has null values"]

  if (isSome(optionalCustomer)) {
      return saveCustomer(optionalCustomer)
  } else {
      return showErrors(optionalCustomer)
  }
}

/*****************************ASYNC*************************************************/
//Use the Future<T> type to write highly readable and composable asynchronously executing code
import {Callback, Async, Future, FutureResult, Success, isSuccess, Failure, onComplete} from "./effects/async"

const asyncValOf = (name: string) => (cb: Callback<string>) => cb(null, valOf(name))
const asyncCheckedOf = (name: string) => (cb:Callback<boolean>) => cb(null, checkedOf(name))

export const processCustomer_async = () => {
  const nameFuture: Future<string> = Async.lift<string>(asyncValOf("Name"))
  const emailFuture = Async.lift<string>(asyncValOf('Email'))
  const vatcodeFuture = Async.lift<string>(asyncValOf('VATCode'))
  const websiteFuture = Async.lift<string>(asyncValOf('Website'))
  const acceptFuture = Async.lift<boolean>(asyncCheckedOf('Accept'))

  const futureCustomer: Future<Customer> = Async.liftA5(
      nameFuture,
      emailFuture,
      vatcodeFuture,
      websiteFuture,
      acceptFuture,
      buildCustomer)

  const text: Future<string> = Async.map(futureCustomer, c => `${c.name}(${c.email})`)
  Async.foreach(text, t => alert(`I'm ${t}!`))

  const saveCustomer = (_: Success<Customer>): true => true
  const showErrors = (e: Failure) => [e.error]

  onComplete<Customer>(futureCustomer, (fr: FutureResult<Customer>) => {
      if (isSuccess(fr)) {
          saveCustomer(fr)
      } else {
          showErrors(fr)
      }
  })
}
