//Validated (light) implementation inspired by Validated type of Cats library (Scala) http://typelevel.org/cats/datatypes/validated.html
export type ValidationError = { kind: string }

export interface Valid<A> {
  a: A
}
export interface Invalid<E> {
  errors: E[]
}
export type Validated<E, A> = Valid<A> | Invalid<E>

export const isValid = <A>(arg: any): arg is Valid<A> => arg.a !== undefined
const isInvalid = <E>(arg: any): arg is Invalid<E> => arg.errors !== undefined

const success = <A>(a: A): Valid<A> => <Valid<A>>{ a: a }
const fail = <E>(e: E | E[]): Invalid<E> =>
  e instanceof Array ? { errors: e } : { errors: [e] }

function isError(arg: any): arg is ValidationError {
  return arg.kind !== undefined
}

export namespace Validation {
  export function lift<E extends ValidationError, A>(
    a: A,
    f: (a: A) => A | E
  ): Validated<E, A> {
    const result = f(a)
    return isError(result) ? fail(result) : success(result)
  }

  export function map<E, A, B>(
    a: Validated<E, A>,
    f: (a: A) => B
  ): Validated<E, B> {
    return isValid(a) ? success(f(a.a)) : a
  }
  export function foreach<E, A>(a: Validated<E, A>, f: (a: A) => void): void {
    if (isValid(a)) f(a.a)
  }
  export function flatmap<E, A, B>(
    a: Validated<E, A>,
    f: (a: A) => Validated<E, B>
  ): Validated<E, B> {
    return isValid(a) ? f(a.a) : a
  }
  export function liftA2<E, A1, A2, B>(
    a1: Validated<E, A1>,
    a2: Validated<E, A2>,
    f: (a: A1, b: A2) => B
  ): Validated<E, B> {
    if (isInvalid(a1) && isValid(a2)) {
      return a1
    }
    if (isValid(a1) && isInvalid(a2)) {
      return a2
    }
    if (isInvalid(a1) && isInvalid(a2)) {
      return fail(a1.errors.concat(a2.errors))
    }
    return flatmap(a2, aa2 => flatmap(a1, aa1 => success(f(aa1, aa2))))
  }
  export function liftA3<E, A1, A2, A3, B>(
    a1: Validated<E, A1>,
    a2: Validated<E, A2>,
    a3: Validated<E, A3>,
    f: (a: A1, b: A2, a3: A3) => B
  ): Validated<E, B> {
    return liftA2(a1, liftA2(a2, a3, (a2, a3) => <[A2, A3]>[a2, a3]), (a1, rest) =>
      f(a1, rest[0], rest[1])
    )
  }
  export function liftA4<E, A1, A2, A3, A4, B>(
    a1: Validated<E, A1>,
    a2: Validated<E, A2>,
    a3: Validated<E, A3>,
    a4: Validated<E, A4>,
    f: (a: A1, b: A2, a3: A3, a4: A4) => B
  ): Validated<E, B> {
    return liftA2(
      a1,
      liftA3(a2, a3, a4, (a2, a3, a4) => <[A2, A3, A4]>[a2, a3, a4]),
      (a1, rest) => f(a1, rest[0], rest[1], rest[2])
    )
  }
  export function liftA5<E, A1, A2, A3, A4, A5, B>(
    a1: Validated<E, A1>,
    a2: Validated<E, A2>,
    a3: Validated<E, A3>,
    a4: Validated<E, A4>,
    a5: Validated<E, A5>,
    f: (a: A1, b: A2, a3: A3, a4: A4, a5: A5) => B
  ): Validated<E, B> {
    return liftA2(
      a1,
      liftA4(
        a2,
        a3,
        a4,
        a5,
        (a2, a3, a4, a5) => <[A2, A3, A4, A5]>[a2, a3, a4, a5]
      ),
      (a1, rest) => f(a1, rest[0], rest[1], rest[2], rest[3])
    )
  }
}
