interface ColorSwatchProps {
  hexCode?: string | null
  name?: string | null
}

export function ColorSwatch({ hexCode, name }: ColorSwatchProps) {
  if (!name) return <>—</>

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/15 dark:border-white/20"
        style={{ backgroundColor: hexCode ?? undefined }}
      />
      {name}
    </span>
  )
}
