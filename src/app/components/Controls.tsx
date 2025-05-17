type Props = {
  isRunning: boolean
  setIsRunning: (val: boolean) => void
}

export default function Controls({ isRunning, setIsRunning }: Props) {
  const handleStart = () => {
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={handleStart}
        className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition"
      >
        Start
      </button>
      <button
        onClick={handleReset}
        className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition"
      >
        Reset
      </button>
    </div>
  )
}
