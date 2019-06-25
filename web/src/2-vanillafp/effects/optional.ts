//Option (light) implementation inspired by Option scala type http://www.scala-lang.org/api/current/scala/Option.html
export interface Some<A> {
  a: A
  type: 'some'
}
export interface None {
  type: 'none'
}
export type Option<A> = Some<A> | None

export const isSome = <_A>(arg: any): arg is Some<_A> => arg.type === 'some'
export const isNone = <_A>(arg: any): arg is None => arg.type === 'none'

const some = <A>(arg: A): Some<A> => <Some<A>>{ a: arg, type: 'some' }
const none = () => <None>{ type: 'none' }

export namespace Optional {
  export function lift<A>(arg: A | null): Option<A> {
    if (arg !== null) return some(arg)
    else return none()
  }

  export function map<A, B>(a: Option<A>, f: (a: A) => B): Option<B> {
    return isSome(a) ? some(f(a.a)) : a
  }
  export function foreach<_E, A>(a: Option<A>, f: (a: A) => void): void {
    if (isSome(a)) f(a.a)
  }

  export function flatmap<A, B>(
    a: Option<A>,
    f: (a: A) => Option<B>
  ): Option<B> {
    return isSome(a) ? f(a.a) : a
  }
  export function liftA2<A1, A2, B>(
    a1: Option<A1>,
    a2: Option<A2>,
    f: (a: A1, b: A2) => B
  ): Option<B> {
    if (isNone(a1) && isNone(a2)) {
      return a1
    }
    if (isSome(a1) && isNone(a2)) {
      return a2
    }
    if (isNone(a1) && isNone(a2)) {
      return none()
    }
    return flatmap(a2, aa2 => flatmap(a1, aa1 => some(f(aa1, aa2))))
  }
  export function liftA3<A1, A2, A3, B>(
    a1: Option<A1>,
    a2: Option<A2>,
    a3: Option<A3>,
    f: (a: A1, b: A2, a3: A3) => B
  ): Option<B> {
    return liftA2(a1, liftA2(a2, a3, (a2, a3) => <[A2, A3]>[a2, a3]), (a1, rest) =>
      f(a1, rest[0], rest[1])
    )
  }
  export function liftA4<_E, A1, A2, A3, A4, B>(
    a1: Option<A1>,
    a2: Option<A2>,
    a3: Option<A3>,
    a4: Option<A4>,
    f: (a: A1, b: A2, a3: A3, a4: A4) => B
  ): Option<B> {
    return liftA2(
      a1,
      liftA3(a2, a3, a4, (a2, a3, a4) => <[A2, A3, A4]>[a2, a3, a4]),
      (a1, rest) => f(a1, rest[0], rest[1], rest[2])
    )
  }
  export function liftA5<A1, A2, A3, A4, A5, B>(
    a1: Option<A1>,
    a2: Option<A2>,
    a3: Option<A3>,
    a4: Option<A4>,
    a5: Option<A5>,
    f: (a: A1, b: A2, a3: A3, a4: A4, a5: A5) => B
  ): Option<B> {
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
