import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-green-200">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to Chicken Farm
        </h1>
        <p className="text-lg text-gray-600">
          Fresh eggs, happy hens, and quality you can trust.
        </p>
      </header>
      <button
        className="px-6 py-3 bg-primary-500 text-white rounded-lg shadow hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50"
        onClick={() => alert("Learn more about our farm!")}
      >
        Learn More
      </button>
    </div>
  );
};

export default App;