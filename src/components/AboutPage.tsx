import React from 'react';
import { Award, Heart, Leaf } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About Our Farm</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Fresh, Quality Poultry Since 1985
            </h2>
            <p className="text-gray-600 mb-4">
              Our family-owned chicken farm has been providing fresh, high-quality poultry 
              products to our community for over 35 years. We pride ourselves on sustainable 
              farming practices and the humane treatment of our animals.
            </p>
            <p className="text-gray-600">
              From farm-fresh eggs to premium chicken meat, we ensure that every product 
              meets the highest standards of quality and freshness.
            </p>
          </div>
          <img
            src="https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg"
            alt="Farm landscape"
            className="rounded-lg shadow-md"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Leaf className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainable</h3>
          <p className="text-gray-600">
            We use eco-friendly farming practices that protect the environment.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Heart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Humane Care</h3>
          <p className="text-gray-600">
            Our chickens are raised with love and care in spacious, clean environments.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Award className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality First</h3>
          <p className="text-gray-600">
            Every product is carefully inspected to ensure the highest quality standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;