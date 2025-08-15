import { html } from 'hono/html'

export const Layout = (title: string, body: any, opts?: { wide?: boolean }) => {
  return html`
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${title}</title>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="stylesheet" href="/styles.css" />
        <style>
          body {
            max-width: ${opts?.wide ? '1200px' : '720px'};
            margin: 40px auto;
            padding: 0 16px;
            font:
              16px/1.6 system-ui,
              sans-serif;
          }
          a {
            color: inherit;
          }
          input,
          textarea,
          button {
            width: 100%;
            padding: 8px;
            margin: 6px 0;
          }
          .post {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .inline {
            display: inline;
          }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `
}
