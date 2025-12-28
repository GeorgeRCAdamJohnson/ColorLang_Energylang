import React from 'react'
import { useDataLoader } from '../../hooks/useDataLoader'

/**
 * Debug component to verify data loading
 */
export const DataDebugger: React.FC = () => {
  const { data, aggregatedData, loading, error } = useDataLoader()

  if (loading) return <div>Loading debug data...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Data Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Raw Data ({data.length} items)</h4>
          <div className="text-sm">
            <p>Languages: {[...new Set(data.map(d => d.language))].join(', ')}</p>
            <p>With J/FLOP: {data.filter(d => d.jPerFlop && d.jPerFlop > 0).length}</p>
          </div>
          <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-2 overflow-auto max-h-32">
            {JSON.stringify(data.slice(0, 3), null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold">Aggregated Data ({aggregatedData.length} items)</h4>
          <div className="text-sm">
            <p>Languages: {aggregatedData.map(d => d.language).join(', ')}</p>
            <p>With J/FLOP: {aggregatedData.filter(d => d.jPerFlop > 0).length}</p>
          </div>
          <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-2 overflow-auto max-h-32">
            {JSON.stringify(aggregatedData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}