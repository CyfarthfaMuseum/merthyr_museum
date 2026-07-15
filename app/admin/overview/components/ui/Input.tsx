import * as React from 'react'

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 min-h-12 max-h-12 w-full shrink-0 rounded-xl border border-neutral-300 bg-white px-4 text-[16px] text-neutral-800 outline-none transition focus:border-neutral-500 ${
        props.className ?? ''
      }`}
    />
  )
}