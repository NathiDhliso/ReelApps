import CandidateDashboard from './CandidateDashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ReelCV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://reelapps.co.za" 
                className="text-gray-600 hover:text-gray-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                Back to ReelApps
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <CandidateDashboard />
      </main>
    </div>
  );
}

export default App; 