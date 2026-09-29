import { Link } from "@tanstack/react-router";
import { BUSINESS } from "@/lib/config";
import { whatsappLink } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-hair bg-ink px-4 pb-28 pt-10 md:px-8 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-sm font-bold text-foreground">
            {BUSINESS.name}{" "}
            <span className="label-mono ml-1 font-normal">Kenya</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-steel">
            Smart Phones. Smart Choices. Genuine smartphones and accessories delivered across Kenya.
          </p>
          <div className="mt-4 font-mono text-[11px] text-steel/70">
            {BUSINESS.phoneDisplay} · {BUSINESS.email}
          </div>
        </div>
        <div>
          <div className="label-mono mb-3">Shop</div>
          <ul className="space-y-2 text-sm text-steel">
            <li><Link to="/shop" className="hover:text-foreground">All phones</Link></li>
            <li><Link to="/deals" className="hover:text-foreground">Today's Deals</Link></li>
            <li><Link to="/accessories" className="hover:text-foreground">Accessories</Link></li>
            <li><Link to="/compare" className="hover:text-foreground">Compare phones</Link></li>
            <li><Link to="/sell" className="hover:text-foreground">Sell your phone</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-mono mb-3">Help</div>
          <ul className="space-y-2 text-sm text-steel">
            <li><Link to="/track" className="hover:text-foreground">Track order</Link></li>
            <li><Link to="/account" className="hover:text-foreground">My account</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li>
              <a
                href={whatsappLink(`Hello ${BUSINESS.name}, I need some help.`)}
                target="_blank"
                rel="noreferrer"
                className="text-whats hover:text-foreground"
              >
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-2 border-t border-hair pt-6 font-mono text-[11px] text-steel/60 md:flex-row">
        <span>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
