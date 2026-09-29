import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle } from "@/components/site/Page";
import { BUSINESS } from "@/lib/config";
import { whatsappLink } from "@/lib/format";
import { useStore } from "@/lib/store";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Market Rise Digital — Phone, WhatsApp & Email" },
      {
        name: "description",
        content:
          "Talk to Market Rise Digital in Nairobi. Call or WhatsApp +254 108 957 557, email marketrisedigital254@gmail.com, or send us a message.",
      },
      { property: "og:title", content: "Contact Market Rise Digital" },
      {
        property: "og:description",
        content: "Phone, WhatsApp, email and a direct message form.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { addEnquiry } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please add your name and a message.");
      return;
    }
    addEnquiry(form);
    setForm({ name: "", email: "", phone: "", message: "" });
    toast.success("Message sent. We'll get back to you shortly.");
  };

  return (
    <Page>
      <PageTitle
        eyebrow="Contact"
        title="Contact Market Rise Digital"
        subtitle="Call, WhatsApp, email or send a message — we reply fast during business hours."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-3">
          <a href={`tel:${BUSINESS.phoneDisplay.replace(/\s/g, "")}`} className="glass flex items-center gap-4 rounded-3xl p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-electric/10">
              <Phone className="size-5 text-electric" />
            </span>
            <span>
              <span className="label-mono block">Phone</span>
              <span className="text-sm text-foreground">{BUSINESS.phoneDisplay}</span>
            </span>
          </a>
          <a
            href={whatsappLink(`Hello ${BUSINESS.name}, I have a question.`)}
            target="_blank"
            rel="noreferrer"
            className="glass flex items-center gap-4 rounded-3xl p-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-whats/15">
              <WhatsAppIcon className="size-5 text-whats" />
            </span>
            <span>
              <span className="label-mono block">WhatsApp</span>
              <span className="text-sm text-foreground">{BUSINESS.phoneDisplay}</span>
            </span>
          </a>
          <a href={`mailto:${BUSINESS.email}`} className="glass flex items-center gap-4 rounded-3xl p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-electric/10">
              <Mail className="size-5 text-electric" />
            </span>
            <span className="min-w-0">
              <span className="label-mono block">Email</span>
              <span className="block truncate text-sm text-foreground">{BUSINESS.email}</span>
            </span>
          </a>
          <div className="glass flex items-center gap-4 rounded-3xl p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-electric/10">
              <MapPin className="size-5 text-electric" />
            </span>
            <span>
              <span className="label-mono block">Location</span>
              <span className="text-sm text-foreground">{BUSINESS.location}</span>
            </span>
          </div>
          <div className="glass flex items-center gap-4 rounded-3xl p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-electric/10">
              <Clock className="size-5 text-electric" />
            </span>
            <span>
              <span className="label-mono block">Hours</span>
              <span className="text-sm text-foreground">{BUSINESS.hours}</span>
            </span>
          </div>
          <div className="glass rounded-3xl p-5">
            <div className="label-mono mb-3">Follow us</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BUSINESS.socials).map(([k, url]) => (
                <a
                  key={k}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-hair px-3 py-1.5 text-xs capitalize text-steel hover:border-electric hover:text-foreground"
                >
                  {k}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="glass h-fit rounded-3xl p-6">
          <div className="label-mono mb-4">Send a message</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Name</span>
              <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Phone</span>
              <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-steel">Email</span>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-steel">Message</span>
              <textarea
                className="field min-h-32"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Which phone are you looking for?"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn-electric mt-5 px-6 py-3 text-sm">
            <Send className="size-4" /> Send message
          </button>
        </form>
      </div>
    </Page>
  );
}
