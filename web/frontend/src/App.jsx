
// 1. import `NextUIProvider` component
import { NextUIProvider } from '@nextui-org/react'
import { GeneratorPage } from './pages/generator'
import "@fontsource/open-sans"; 
import "./shared/styles/globals.css"
export default function App() {
  return (
    <NextUIProvider>
      <GeneratorPage />
    </NextUIProvider>
  )
}