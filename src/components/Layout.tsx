import React from 'react'

interface LayoutProps {
  title: string
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <html lang="ja" className="bg-gray-100 w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="stylesheet" href="/output.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css"
        />
      </head>
      <body className="min-h-screen font-sans overflow-y-auto overflow-x-clip flex flex-col">
        <div className="main-content flex flex-col justify-center items-center">{children}</div>
      </body>
    </html>
  )
}

export default Layout
