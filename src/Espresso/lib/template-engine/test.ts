import { TemplateParser } from './TemplateParser';
import { TemplateRender } from './TemplateRender';

export const template = `
{{> header }}
{{#if showList}}
  <ul>
  {{#each items as i}}
    <li>{{i.name}} - {{{i.description}}}</li>
  {{/each}}
  </ul>
{{else}}
  <p>No items to display.</p>
{{/if}}
{{> footer }}
`;

export const header = `
<html>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="/css/styles.css">
    <script src="/js/main.js" defer></script>
  </head>
  <body>
    <h1>My App</h1>
`;

export const footer = `
  </body>
  <footer>
    <p>Copyright 2025</p>
  </footer>
</html>
`;
