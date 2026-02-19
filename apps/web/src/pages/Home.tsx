import React from 'react';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Home 👋</h1>
      <p className="text-gray-600 text-center max-w-md">
        This is a simple placeholder Home page. You can customize this section
        with hero content, navigation, or landing information.
      </p>

      <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        Get Started
      </button>


      <div className="flex flex-col items-center mt-5">
        <div className="flex gap-0 -mt-0">
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room
          </Button>
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room2
          </Button>
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room3
          </Button>
        </div>
        <div className="flex gap-0 -mt-0 absolute mt-19">
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room4
          </Button>
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room5
          </Button>
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room6
          </Button>
          <Button variant="hex" size="hex" onClick={() => alert("Kitchen clicked")}>
            Room7
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
