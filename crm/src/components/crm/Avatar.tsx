const PALETTE = ['#CBA968', '#4A8288', '#8A6F2E', '#2F5C61', '#B08D57', '#6B8E8A']

function colorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export default function Avatar({ nome, apelido, size = 34 }: { nome: string; apelido?: string | null; size?: number }) {
  const initials = `${nome?.[0] ?? ''}${apelido?.[0] ?? nome?.[1] ?? ''}`.toUpperCase()
  const bg = colorFor(nome + (apelido ?? ''))
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials || '?'}
    </div>
  )
}
