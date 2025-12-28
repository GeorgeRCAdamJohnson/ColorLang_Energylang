import React from 'react'

/**
 * Ultra Simple Chart - Just HTML/CSS to test if the tab is working
 */
export const UltraSimpleChart: React.FC = () => {
  console.log('🚀 UltraSimpleChart: Rendering successfully')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-4 border-green-500">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        ✅ SUCCESS! New Chart Component is Working!
      </h2>
      
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">🎯 Key Research Finding</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">6.3x</div>
            <div className="text-sm">C++ More Efficient than Python</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2.42e-8</div>
            <div className="text-sm">C++ J/FLOP (Best)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">15.16e-8</div>
            <div className="text-sm">Python J/FLOP (Worst)</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">🏆 Language Rankings (J/FLOP - Lower is Better)</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <span className="font-medium">1. C++</span>
            <span className="text-sm">2.42e-8 J/FLOP</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <span className="font-medium">2. Rust</span>
            <span className="text-sm">2.85e-8 J/FLOP</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <span className="font-medium">3. Go</span>
            <span className="text-sm">4.56e-8 J/FLOP</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <span className="font-medium">4. Java</span>
            <span className="text-sm">5.23e-8 J/FLOP</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <span className="font-medium">5. EnergyLang</span>
            <span className="text-sm">8.90e-8 J/FLOP</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="font-medium">6. Python</span>
            <span className="text-sm">15.16e-8 J/FLOP</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          📊 If you can see this component, the tab system is working correctly. 
          The issue was likely with Chart.js rendering, not the component system.
        </p>
      </div>
    </div>
  )
}