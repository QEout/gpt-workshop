import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'


export const metadata: Metadata = {
  title: 'Next GPT Agents',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      </head>
      <body >
      <Toaster />
        {children}</body>
    </html>
  )
}
