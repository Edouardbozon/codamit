import { LitElement } from "@polymer/lit-element/lit-element";
import { html, TemplateResult } from "lit-html";

import router from "../../../app-router";

export default class Admin extends LitElement {
  render(): TemplateResult {
    return html`
      <link href="assets/css/bulma.min.css" rel="stylesheet">
      <style>
        :host {
          display: block;
        }
      </style>
      <ez-page>
        <section class="section">
          <h1 class="title">Admin</h1>
          <a class="button is-primary block"
            href="/admin/draft"
            title="Start writing"
            @click=${(e: Event) => {
              e.preventDefault();
              router.push(`/admin/draft`);
            }}>
            Start a new draft
          </a>
        </section>
        <ez-article-feed adminMode=${true}></ez-article-feed>
      </ez-page>
    `;
  }
}