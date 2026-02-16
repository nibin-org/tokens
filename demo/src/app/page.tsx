'use client'

import { TokenDocumentation } from 'tokvista'
import 'tokvista/styles.css'
import tokens from '../../../tokens.json' // Real tokens from Figma Token Studio

export default function Home() {
  return (
    <main>
      <TokenDocumentation
        tokens={tokens}
        title="Tokvista Demo"
        subtitle={`Real tokens from Figma Token Studio - Version ${process.env.NEXT_PUBLIC_PACKAGE_VERSION}`}
        onTokenClick={(token) => {
          console.log('Token clicked:', token)
        }}
      />
    </main>
  )
}
