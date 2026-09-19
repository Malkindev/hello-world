import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle } from "@/components/site/Page";
import { BUSINESS } from "@/lib/config";
import { useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Phone | Market Rise Digital" },
      { name: "description", content: "Sell your used or new phone to Market Rise Digital. Tell us the model, condition, expected price and location and we'll review your offer." },
      { property: "og:title", content: "Sell Your Phone | Market Rise Digital" },
      { property: "og:description", content: "Submit your phone details and get a review from Market Rise Digital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellPage,
});

const CONDITIONS = ["Brand New", "Refurbished", "Pre-owned"] as const;

function SellPage() {
  const { addSubmission } = useStore();
  const [photos, setPhotos] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    storage: "",
    condition: "Pre-owned",
    expectedPrice: "",
    location: "",
    description: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.brand.trim() || !form.model.trim()) {
      toast.error("Please fill in your name, phone, brand and model.");
      return;
    }

    addSubmission({
      name: form.name.trim(),
      phone: form.phone.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      storage: form.storage.trim() || "Not specified",
      condition: form.condition,
      expectedPrice: Number(form.expectedPrice) || 0,
      location: form.location.trim() || "Not specified",
      description: form.description.trim(),
      photos,
    });

    setForm({
      name: "",
      phone: "",
      brand: "",
      model: "",
      storage: "",
      condition: "Pre-owned",
      expectedPrice: "",
      location: "",
      description: "",
    });
    setPhotos(0);
    toast.success("Phone details submitted. We'll review them and contact you.");
  };

  return (
    <Page>
      <PageTitle
        eyebrow="Sell your phone"
        title="Turn your phone into cash"
        subtitle="Send us the details of your phone. We review the condition, compare the model with current demand and get back to you with an offer."
        action={
          <a
            href={whatsappLink("Hello " + BUSINESS.name + ", I would like to sell my phone.")}
            target="_blank"
            rel="noreferrer"
            className="btn-whats px-4 py-2.5 text-xs"
          >
            <WhatsAppIcon className="size-4" /> Sell on WhatsApp
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="glass rounded-3xl p-6">
          <div className="label-mono mb-5">Phone details</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Your name</span>
              <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Phone number</span>
              <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07xx xxx xxx" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Brand</span>
              <input className="field" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Apple" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Model</span>
              <input className="field" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="iPhone 14 Pro" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Storage</span>
              <input className="field" value={form.storage} onChange={(e) => set("storage", e.target.value)} placeholder="256GB" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Condition</span>
              <select className="field" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Expected price (KSh)</span>
              <input className="field" value={form.expectedPrice} onChange={(e) => set("expectedPrice", e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="45000" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-steel">Location</span>
              <input className="field" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Nairobi" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-steel">Condition notes</span>
              <textarea className="field min-h-28" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Battery health, scratches, repairs, accessories, network status..." />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-steel">Photos</span>
              <input className="field" type="file" accept="image/*" multiple onChange={(e) => setPhotos(Math.min(e.target.files?.length ?? 0, 6))} />
              <span className="mt-1.5 flex items-center gap-1.5 text-xs text-steel">
                <Camera className="size-3.5" /> {photos} photo{photos === 1 ? "" : "s"} selected (up to 6)
              </span>
            </label>
          </div>

          <button type="submit" className="btn-electric mt-6 px-6 py-3 text-sm">
            <Send className="size-4" /> Submit phone details
          </button>
        </form>

        <aside className="space-y-3">
          <div className="glass rounded-3xl p-6">
            <div className="label-mono mb-3">How it works</div>
            <div className="space-y-4 text-sm text-steel">
              <div><span className="font-semibold text-foreground">01 · Submit details</span><p className="mt-1">Tell us the model, condition, price expectation and location.</p></div>
              <div><span className="font-semibold text-foreground">02 · We review</span><p className="mt-1">Our team checks the details and may ask for more photos or information.</p></div>
              <div><span className="font-semibold text-foreground">03 · Receive an offer</span><p className="mt-1">We contact you with the next steps and arrange inspection or handover.</p></div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <ShieldCheck className="size-5 text-electric" />
            <div className="mt-3 font-display font-semibold text-foreground">Private & straightforward</div>
            <p className="mt-1 text-sm text-steel">Your submission stays on this device until a connected backend is added. For immediate review, use WhatsApp.</p>
            <a href={whatsappLink("Hello " + BUSINESS.name + ", I want to sell my phone and need help with the next steps.")} target="_blank" rel="noreferrer" className="btn-ghost mt-4 w-full px-4 py-2.5 text-xs">
              <MessageCircle className="size-4" /> Chat with us
            </a>
          </div>
        </aside>
      </div>
    </Page>
  );
}
