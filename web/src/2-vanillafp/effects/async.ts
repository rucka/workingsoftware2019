//Future (light) implementation inspired by Scala Future http://docs.scala-lang.org/overviews/core/futures.html
export type Callback<A> = (e: string | null, a: A | null) => void

export interface Success<A> {
  a: A
  type: 'success'
}
export interface Failure {
  error: string
  type: 'failure'
}
export type FutureResult<A> = Success<A> | Failure
export type Future<A> = {
  type: 'future'
  f: (cb: Callback<A>) => void
}

export const isSuccess = <A>(arg: any): arg is Success<A> =>
  arg.type === 'success'
export const isFailure = <_E>(arg: any): arg is Failure =>
  arg.type === 'failure'

const success = <A>(a: A): Success<A> => <Success<A>>{ a: a, type: 'success' }
const fail = (e: string): Failure => <Failure>{ error: e, type: 'failure' }

export function onComplete<A>(
  a: Future<A>,
  f: (r: FutureResult<A>) => void
): void {
  a.f((e, a) => {
    if (e !== null) return f(fail(e))
    if (a !== null) return f(success(a))
    return fail('invalid operation: both error and argument cannot be null')
  })
}
export namespace Async {
  export function lift<A>(f: (cb: Callback<A>) => void): Future<A> {
    return { type: 'future', f: f }
  }

  export function map<A, B>(a: Future<A>, f: (a: A) => B): Future<B> {
    const fB = function(cb: Callback<B>) {
      a.f((e: string | null, a: A | null) => {
        if (e === null) cb(e, null)
        if (a) cb(null, f(a))
        cb('invalid error', null)
      })
    }
    return lift<B>(fB)
  }
  export function foreach<A>(a: Future<A>, f: (a: A) => void): void {
    a.f((_: string | null, a: A | null) => {
      if (a) f(a)
    })
  }
  export function flatmap<A, B>(
    a: Future<A>,
    f: (a: A) => Future<B>
  ): Future<B> {
    const fB = function(cbB: Callback<B>) {
      a.f((eA: string | null, a: A | null) => {
        if (eA === null) return cbB(eA, null)
        if (a) {
          const futB: Future<B> = f(a)
          futB.f((eB: string | null, b: B | null) => {
            if (eB === null) return cbB(eB, null)
            cbB(null, b)
          })
        }
      })
    }
    return lift<B>(fB)
  }
  export function liftA2<A1, A2, B>(
    a1: Future<A1>,
    a2: Future<A2>,
    f: (a: A1, b: A2) => B
  ): Future<B> {
    const fB = function(cbB: Callback<B>) {
      a1.f((e1, a1) => {
        if (e1 === null) return cbB(e1, null)
        a2.f((e2, a2) => {
          if (e2 === null) return cbB(e2, null)
          if (a1 && a2) return cbB(null, f(a1, a2))
        })
      })
    }
    return lift<B>(fB)
  }
  export function for3<A1, A2, A3, B>(
    a1: Future<A1>,
    a2: Future<A2>,
    a3: Future<A3>,
    f: (a: A1, b: A2, a3: A3) => B
  ): Future<B> {
    return liftA2(a1, liftA2(a2, a3, (a2, a3) => <[A2, A3]>[a2, a3]), (a1, rest) =>
      f(a1, rest[0], rest[1])
    )
  }
  export function liftA4<A1, A2, A3, A4, B>(
    a1: Future<A1>,
    a2: Future<A2>,
    a3: Future<A3>,
    a4: Future<A4>,
    f: (a: A1, b: A2, a3: A3, a4: A4) => B
  ): Future<B> {
    return liftA2(
      a1,
      for3(a2, a3, a4, (a2, a3, a4) => <[A2, A3, A4]>[a2, a3, a4]),
      (a1, rest) => f(a1, rest[0], rest[1], rest[2])
    )
  }
  export function liftA5<A1, A2, A3, A4, A5, B>(
    a1: Future<A1>,
    a2: Future<A2>,
    a3: Future<A3>,
    a4: Future<A4>,
    a5: Future<A5>,
    f: (a: A1, b: A2, a3: A3, a4: A4, a5: A5) => B
  ): Future<B> {
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
