import { Facebook, Twitter, Youtube, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_LINKS = {
  Découvrir: [
    { label: 'À propos', href: 'https://www.d1g1factory.org/' },
    { label: 'Notre équipe', href: 'https://www.d1g1factory.org/team-4' },
    {
      label: 'Nos réalisations',
      href: 'https://www.d1g1factory.org/projects-8',
    },
  ],
  'Se connecter': [
    { label: 'Nous contacter', href: 'https://www.d1g1factory.org/contact-9' },
    { label: 'Nos services', href: 'https://www.d1g1factory.org/services-4' },
  ],
};

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/d1g1factory?modal=admin_todo_tour',
    icon: <Facebook size={16} />,
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/HenryJulie',
    icon: <Twitter size={16} />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UCPAbqRaHkOZ0sKH_fusA9ng?view_as=subscriber',
    icon: <Youtube size={16} />,
  },
];

export const Footer = () => {
  return (
    <footer className="text-foreground">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        {/* Top row */}
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand block */}
          <div className="max-w-xs">
            <p className="mb-1.5 font-serif text-2xl tracking-tight text-foreground">
              digi<span className="text-mauve">Factory</span>
            </p>
            <p className="mb-6 text-sm leading-relaxed dark:text-gray-300 text-gray-800">
              A digital innovation lab bridging technology and society at the
              University of Namur.
            </p>
            <Link
              to="https://unamur.be/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 rounded-full border border-[#2a2a27]
                px-3.5 py-1.5 text-xs text-gray-500 no-underline
                transition-colors hover:border-gray-500 hover:text-[#d4cfc5]
              "
            >
              <GraduationCap size={13} />
              UNamur partner
            </Link>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12">
            {Object.entries(NAV_LINKS).map(([section, links]) => (
              <div key={section}>
                <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-gray-500">
                  {section}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm font-light text-gray-500 no-underline transition-colors hover:text-[#f5f3ee]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gray-500" />

        {/* Bottom row */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs dark:text-gray-300 text-gray-800">
            © {new Date().getFullYear()} digiFactory — University of Namur. All
            rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex gap-1.5">
            {SOCIAL_LINKS.map(social => (
              <Link
                key={social.href}
                to={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="
                  flex h-8 w-8 items-center justify-center rounded-lg
                  border border-gray-500 text-mauve no-underline
                  transition-colors hover:border-mauve hover:bg-mauve hover:text-white!
                "
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
