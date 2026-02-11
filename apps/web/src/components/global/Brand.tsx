import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
export function Brand() {
  return (
    <Link to="/app" className=" flex items-center gap-1.5">
      <img src={logo} alt="logo-image" className="size-8!" />
      <span className="text-base font-semibold">Idearium</span>
    </Link>
  );
}
