import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tufikie</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Namba za Simu</p>
                <p className="text-gray-600">+255-746-283-053</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Barua pepe</p>
                <p className="text-gray-600">emmanuelmbuli7@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Mahali</p>
                <p className="text-gray-600">123 farm road,Kibwagile,Pwani, Tanzania</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-primary-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Masaa ya Kazi </p>
                <p className="text-gray-600">Mon-Sat: 7:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Sunday: 8:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tutumie Mesegi</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JIna
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Jina lako.."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barua pepe
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Barua pepe yako.."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesegi
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ujumbe wako..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors"
            >
              Tuma Ujumbe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;