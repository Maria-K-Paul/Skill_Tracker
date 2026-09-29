import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-primary">Skill Leveling Platform</span>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-900 font-medium hover:text-primary transition-colors">Domains</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">My Progress</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Dashboard</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-sm font-medium text-gray-700 hover:text-primary">Sign In</button>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium shadow hover:bg-blue-800 transition-colors">Register</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Level Up Your Skills</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Book exams, validate your knowledge, and progress through expert-curated skill tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-surface rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                <span className="text-4xl">💻</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Web Development Track {item}</h3>
                <p className="mt-2 text-sm text-gray-500">Master HTML, CSS, JavaScript and modern frameworks.</p>
                <div className="mt-4">
                  <button className="text-primary font-medium text-sm hover:underline">View Levels &rarr;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
