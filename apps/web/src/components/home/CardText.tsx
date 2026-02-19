import Aos from 'aos';
import { useEffect } from 'react';
import 'aos/dist/aos.css';

function CardText(props: { animation: any; header: string; text: string }) {
  useEffect(function () {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <div data-aos={props.animation} className="w-full max-w-md p-6">
      <h5 className="mb-4 text-2xl md:text-3xl font-semibold tracking-tight text-heading leading-8">
        {props.header}
      </h5>
      <p className="text-body text-lg md:text-xl">{props.text}</p>
    </div>
  );
}
export default CardText;
