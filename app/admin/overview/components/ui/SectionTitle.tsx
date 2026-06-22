export default function SectionTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return <h2 className="text-[20px] font-semibold text-neutral-900">{children}</h2>
}