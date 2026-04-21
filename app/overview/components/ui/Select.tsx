import * as React from 'react'

export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-[16px] text-neutral-800 outline-none transition focus:border-neutral-500 ${
        props.className ?? ''
      }`}
    />
  )
}