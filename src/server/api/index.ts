import { combineRoutes, EffectFactory } from "@marblejs/core";

import { article$ } from "./article";
import { notFoundEffect$ } from "./common/effects/not-found.effect";
import { getTweetsEffect$ } from "./tweet/effects/get-tweets.effect";

const getTweets$ = EffectFactory.matchPath("/tweet")
  .matchType("*")
  .use(getTweetsEffect$);

const notFound$ = EffectFactory.matchPath("*")
  .matchType("*")
  .use(notFoundEffect$);

export const api$ = combineRoutes("/api/v1", [
  article$,
  getTweets$,
  notFound$,
]);
