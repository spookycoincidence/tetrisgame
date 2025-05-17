export default function Board() {
  const rows = 20
  const cols = 10
  const cells = Array.from({ length: rows * cols })

  return (
    <div
      className="grid gap-[1px] bg-gray-800"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        width: '200px',
        height: '400px',
      }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          className="bg-black border border-gray-700"
          style={{ aspectRatio: '1' }}
        />
      ))}
    </div>
  )
}
