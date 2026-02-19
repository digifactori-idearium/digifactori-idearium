import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

function Card(props: { animation: string; image: string }) {
  useEffect(function () {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <div data-aos={props.animation} className="w-full flex justify-center">
      <img
        src={props.image}
        alt="card image"
        className="w-full max-w-md h-auto object-contain rounded-lg shadow-lg"
      />
    </div>
  );
}
export default Card;
