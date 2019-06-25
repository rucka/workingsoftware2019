import { Curried5 } from 'fp-ts/lib/function'
import { URIS2, Type2 } from 'fp-ts/lib/HKT'
import { Apply2C } from 'fp-ts/lib/Apply'

//fp-ts doesn't provide a liftA5 function so we need to write it in order to handle our Customer validation case.
//For detailed explanation of How do that, thake a look at: https://dev.to/gcanti/getting-started-with-fp-ts-applicative-1kb3
export function liftA5<F extends URIS2, L>(F: Apply2C<F, L>): <A, B, C, D, E, G>(f: Curried5<A, B, C, D, E, G>) => (fa: Type2<F, L, A>) => (fb: Type2<F, L, B>) => (fc: Type2<F, L, C>) => (fd: Type2<F, L, D>) => (fe: Type2<F, L, E>) => Type2<F, L, G> {
  return f => fa => fb => fc => fd => fe => F.ap(F.ap(F.ap(F.ap(F.map(fa, f), fb), fc), fd),fe)
}
