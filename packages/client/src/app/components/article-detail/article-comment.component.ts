import { format } from 'date-fns';
import * as frLocale from 'date-fns/locale/fr';
import { css, html, LitElement, property } from 'lit-element';
import { nothing } from 'lit-html';

import { translate } from '../../core/directives/translate.directive';
import { apiClient } from '../../core/services/api-client';
import { buttonStyle } from '../../shared/button';
import { ResourceCollection } from '../../utils/collection';
import { Comment } from './types';
import { formStyle } from '../../shared/form';

export default class ArticleCommentComponent extends LitElement {
  @property({ type: String })
  articleId: string | null = null;

  commentCollection: ResourceCollection<Comment> | null = null;

  showEditor = false;

  loading = true;

  error: string | null = null;

  firstUpdated() {
    this.fetch();
  }

  async fetch(): Promise<void> {
    const commentCollection = await apiClient.get<ResourceCollection<Comment>>(
      `/api/v1/article/${this.articleId}/comment`
    );

    this.commentCollection = commentCollection;
    this.loading = false;
    this.requestUpdate();
  }

  isFormValid(): boolean {
    if (!this.showEditor) {
      return false;
    }

    const nameCtrl = this.shadowRoot!.querySelector('#name') as HTMLInputElement;
    const commentCtrl = this.shadowRoot!.querySelector('#comment') as HTMLTextAreaElement;

    if (!nameCtrl || !commentCtrl) {
      return false;
    }

    const name = nameCtrl.value;
    const comment = commentCtrl.value;

    return !!name && !!comment;
  }

  postComment(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.requestUpdate();

    const name = (this.shadowRoot!.querySelector('#name') as HTMLInputElement).value;
    const comment = (this.shadowRoot!.querySelector('#comment') as HTMLTextAreaElement).value;
    const formData = { author: name, comment, articleId: this.articleId };

    apiClient
      .post<ResourceCollection<Comment>>(`/api/v1/article/${this.articleId}/comment`, formData)
      .then(() => this.fetch())
      .then(() => {
        this.showEditor = false;
        this.loading = false;
        this.requestUpdate();
      })
      .catch(err => {
        this.error = err.message ? err.message : err;
        this.loading = false;
        this.requestUpdate();
      });
  }

  static get styles() {
    return [
      formStyle,
      buttonStyle,
      css`
        :host {
          display: block;
          margin-top: 0.6rem;
          margin-bottom: 3rem;
        }

        form[name='postComment'] {
          font-size: 1rem;
          margin: 2rem 0;
        }

        .comments {
          margin-top: 2rem;
          font-size: 1rem;
        }

        .message header em {
          font-weight: 100;
          font-size: 14px;
          text-transform: capitalize;
        }
      `,
    ];
  }

  render() {
    return html`
      <div>
        <button
          type="button"
          class="button is-primary is-block"
          @click="${() => {
            this.showEditor = !this.showEditor;
            this.requestUpdate();
          }}"
        >
          ${!this.showEditor
            ? translate('article_detail.leave_comment_btn')
            : translate('article_detail.stop_comment_btn')}
        </button>
        ${this.showEditor
          ? html`
              <form
                name="postComment"
                @submit=${this.postComment}
                @input=${() => this.update(new Map())}
              >
                ${this.error
                  ? html`
                      <div class="notification is-danger">
                        <button
                          class="delete"
                          @click="${() => {
                            this.error = null;
                            this.requestUpdate();
                          }}"
                        ></button>
                        ${this.error}
                      </div>
                    `
                  : nothing}
                <div class="field">
                  <label for="name">${translate('article_detail.name_label')}</label>
                  <div class="control">
                    <input class="input" name="name" id="name" type="text" required />
                  </div>
                </div>
                <div class="field">
                  <label for="comment">${translate('article_detail.comment_label')}</label>
                  <div class="control">
                    <textarea
                      class="textarea ${this.loading
                        ? html`
                            is-loading
                          `
                        : nothing}"
                      name="comment"
                      id="comment"
                      required
                    ></textarea>
                  </div>
                </div>
                <button type="submit" ?disabled=${!this.isFormValid()} class="button">
                  ${translate('article_detail.comment_btn')}
                </button>
              </form>
            `
          : nothing}
        <section class="comments">
          ${this.commentCollection !== null
            ? this.commentCollection.collection.map(
                comment => html`
                  <article class="message">
                    <div class="message-body is-dark">
                      <header>
                        <strong>${comment.author}</strong>
                        <em>
                          -
                          ${format(new Date(comment.createdAt), 'ddd DD MMM YYYY', {
                            locale: frLocale,
                          })}
                        </em>
                      </header>
                      ${comment.comment}
                    </div>
                  </article>
                `
              )
            : null}
        </section>
      </div>
    `;
  }
}

customElements.define('ez-article-comments', ArticleCommentComponent);