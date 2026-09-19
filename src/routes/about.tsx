import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Handshake, ShieldCheck, Truck } from "lucide-react";
import { Page, PageTitle } from "@/components/site/Page";
import { BUSINESS } from "@/lib/config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Market Rise Digital — Genuine Phones in Kenya" },
      {
        name: "description",
        content:
          "Market Rise Digital is a modern technology marketplace making quality smartphones and digital accessories easier to discover and purchase in Kenya.",
      },
      { property: "og:title", content: "About Market Rise Digital" },
      {
        property: "og:description",
        content: "A simple, transparent and convenient way to buy genuine smartphones in Kenya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Genuine stock only",
    body: "Every phone is sourced from trusted suppliers and checked before it reaches you.",
  },
  {
    icon: ShieldCheck,
    title: "Clear warranty",
    body: "Warranty terms are printed on every product page — no surprises after the sale.",
  },
  {
    icon: Truck,
    title: "Countrywide delivery",
    body: "Same-day around Nairobi CBD and trusted couriers to every major town in Kenya.",
  },
  {
    icon: Handshake,
    title: "Honest pricing",
    body: "One price in KSh, shown upfront, with the original price whenever there is a discount.",
  },
];

function AboutPage() {
  return (
    <Page>
      <PageTitle
        eyebrow="About us"
        title="Smart phones. Smart choices."
        subtitle={BUSINESS.tagline}
      />

      <section className="glass rounded-3xl p-6 animate-rise sm:p-10">
        <p className="max-w-3xl text-base leading-relaxed text-steel sm:text-lg">
          Market Rise Digital is a modern technology marketplace focused on making quality
          smartphones and digital accessories easier to discover and purchase. We aim to provide
          customers with a simple, transparent, and convenient shopping experience.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="glass rounded-3xl p-6">
            <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-electric/10">
              <v.icon className="size-5 text-electric" />
            </div>
            <div className="font-display text-lg font-semibold text-foreground">{v.title}</div>
            <p className="mt-1.5 text-sm text-steel">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-lg font-semibold text-foreground">
            Ready to find your next phone?
          </div>
          <p className="mt-1 text-sm text-steel">
            Browse the catalogue or talk to us — we're in {BUSINESS.location}, {BUSINESS.hours}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/shop" className="btn-electric px-5 py-3 text-sm">
            Shop phones
          </Link>
          <Link to="/contact" className="btn-ghost px-5 py-3 text-sm">
            Contact us
          </Link>
        </div>
      </div>
    </Page>
  );
}
