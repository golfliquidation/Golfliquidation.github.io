import { NavLink, Outlet } from "react-router-dom";
import { ConfigBanner } from "@/components/ConfigBanner";

const navItems = [
  { to: "/", label: "Home", icon: "⌂", end: true },
  { to: "/shop", label: "Shop", icon: "⛳" },
  { to: "/about", label: "About", icon: "★" },
  { to: "/contact", label: "Contact", icon: "✉" },
];

export function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <NavLink to="/" className="brand">
            <span className="brand__title">Golf Liquidation</span>
            <span className="brand__tag">Texas · Est. 2020</span>
          </NavLink>
          <nav className="desktop-nav" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <NavLink to="/admin/login" className="header-link">
            Host
          </NavLink>
        </div>
      </header>
      <ConfigBanner />
      <Outlet />
      <nav className="bottom-nav" aria-label="Mobile">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <span className="bottom-nav__icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
