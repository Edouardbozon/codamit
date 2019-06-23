import { stringify } from 'query-string';
import { Action } from 'redux';
import { combineEpics, ofType } from 'redux-observable';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Article } from '../../components/admin/types';
import { ResourceCollection } from '../../utils/collection';
import { apiClient } from '../services';
import { LOAD_ARTICLES, loadArticlesFulfilled } from './client.actions';
import { failure } from './common.actions';

const loadArticlesEpic = (action$: Observable<any>): Observable<Action> =>
  action$.pipe(
    ofType(LOAD_ARTICLES),
    switchMap(action =>
      from(
        apiClient.get(
          `${action.payload.includeDrafts ? '/api/v1/draft' : '/api/v1/article'}?${stringify(
            { ...action.payload, sortDir: -1 },
            { arrayFormat: 'bracket' }
          )}`
        )
      ).pipe(
        map(response => loadArticlesFulfilled(response as ResourceCollection<Article>)),
        catchError(err => of(failure(err)))
      )
    )
  );

export const clientEpic = combineEpics(loadArticlesEpic);
