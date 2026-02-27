import { Link } from 'react-router-dom';

import logo from '../../assets/images/logo.png';
export function Brand() {
  return (
    <Link to="/" className="w-full flex justify-center items-end gap-1.5">
      <img src={logo} alt="logo-image" className="size-8!" />
      <span className="text-base font-semibold">Idearium</span>
    </Link>
  );
}
