import { html } from 'hono/html'

export const Layout = (title: string, body: any, opts?: { wide?: boolean }) => {
  return html`
    <html lang="ja" class="bg-gray-100">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${title}</title>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="stylesheet" href="/output.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          integrity="sha384-k6RqeWeci5ZR/Lv4MR0sA0FfDOM3y5iZ9fX1pht6WZ5n6p5+8nR6c5f5f5f5f5f5"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css"
        />
      </head>
      <body
        class="max-w-${opts?.wide
          ? '5xl'
          : 'xl'} ml-4 mr-4 mt-0 px-4 font-sans h-screen overflow-auto md:overflow-hidden flex flex-col"
      >
        <div class="main-content flex flex-col justify-center items-center">${body}</div>
      </body>
    </html>
  `
}
