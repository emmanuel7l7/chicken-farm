import React from "react";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-green-200">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Chicken Farm</h1>
        <p className="text-lg text-gray-600">Fresh eggs, happy hens, and quality you can trust.</p>
      </header>
      <a
        href="#"
        className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        Learn More
      </a>
    </div>
  );
}

export default App;
