import { html } from 'hono/html'

export const Layout = (title: string, body: any, opts?: { wide?: boolean }) => {
  return html`
    <html lang="ja" class="bg-gray-100">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${title}</title>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="stylesheet" href="/output.css?v=1" />
      </head>
      <body class="max-w-${opts?.wide ? '5xl' : 'xl'} ml-4 mr-4 my-10 px-4 font-sans">
        ${body}
      </body>
    </html>
  `
}
