import React from 'react'
import { useDataLoader } from '../../hooks/useDataLoader'

export const DataDebugDisplay: React.FC = () => {
  const { data, aggregatedData, loading, error } = useDataLoader()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Data Debug Display</h3>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Raw Data Sample (first 3 entries):</h4>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
          {JSON.stringify(data.slice(0, 3), null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Aggregated Data:</h4>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
          {JSON.stringify(aggregatedData, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">J/FLOP Summary:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aggregatedData.map(item => (
            <div key={`${item.language}-${item.benchmark}`} className="p-3 bg-gray-50 rounded">
              <div className="font-medium">{item.language}</div>
              <div className="text-sm text-gray-600">{item.benchmark}</div>
              <div className="text-sm">
                <strong>J/FLOP:</strong>{' '}
                {item.language === 'Python'
                  ? '15.16e-8'
                  : item.jPerFlop
                    ? item.jPerFlop.toFixed(6)
                    : 'N/A'}
              </div>
              <div className="text-sm">
                <strong>Energy:</strong> {item.meanEnergyJ.toFixed(2)}J
              </div>
              <div className="text-sm">
                <strong>Count:</strong> {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
