import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MapPin, Package, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { useStore } from "@/lib/store";
import { ksh } from "@/lib/format";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Market Rise Digital" },
      { name: "description", content: "Manage your Market Rise Digital profile, addresses, favourites and local order history." },
      { property: "og:title", content: "My Account | Market Rise Digital" },
      { property: "og:description", content: "Profile, favourites, addresses and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const {
    user, signIn, signOut, orders, wishlist, products, addresses, addAddress, removeAddress, hydrated,
  } = useStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [address, setAddress] = useState({ label: "", location: "", address: "" });

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    signIn(profile);
    setEditingProfile(false);
    toast.success("Profile saved on this device.");
  };

  const saveAddress = (event: React.FormEvent) => {
    event.preventDefault();
    if (!address.label.trim() || !address.address.trim()) {
      toast.error("Please add an address label and delivery address.");
      return;
    }
    addAddress(address);
    setAddress({ label: "", location: "", address: "" });
    toast.success("Address saved.");
  };

  if (!hydrated) {
    return (
      <Page>
        <PageTitle eyebrow="Account" title="Your account" />
        <div className="glass h-64 rounded-3xl" />
      </Page>
    );
  }

  const favourites = wishlist
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <Page>
      <PageTitle
        eyebrow="Account"
        title={user.signedIn ? "Welcome, " + (user.name.split(" ")[0] || "there") : "Your account"}
        subtitle="Keep your profile, favourite phones, saved addresses and order history together."
        action={user.signedIn ? <button onClick={signOut} className="btn-ghost px-4 py-2 text-xs">Sign out</button> : undefined}
      />

      {!user.signedIn || editingProfile ? (
        <section className="glass rounded-3xl p-6">
          <div className="label-mono mb-4">Profile</div>
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-3">
            <input className="field" placeholder="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} required />
            <input className="field" type="tel" placeholder="07xx xxx xxx" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} required />
            <input className="field" type="email" placeholder="Email (optional)" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            <div className="flex gap-2 sm:col-span-3">
              <button className="btn-electric px-5 py-2.5 text-sm" type="submit">{user.signedIn ? "Save changes" : "Save profile"}</button>
              {editingProfile && <button type="button" onClick={() => setEditingProfile(false)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>}
            </div>
          </form>
          {!user.signedIn && <p className="mt-3 text-xs text-steel">This version keeps account data in your browser. A server-backed login can be connected later without changing the page layout.</p>}
        </section>
      ) : (
        <section className="glass rounded-3xl p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-electric/10"><UserRound className="size-5 text-electric" /></span>
              <div>
                <div className="font-display font-semibold text-foreground">{user.name}</div>
                <div className="text-sm text-steel">{user.phone}{user.email ? " · " + user.email : ""}</div>
              </div>
            </div>
            <button onClick={() => { setProfile({ name: user.name, email: user.email, phone: user.phone }); setEditingProfile(true); }} className="btn-ghost px-4 py-2 text-xs">Edit profile</button>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><div className="label-mono">Favourites</div><div className="font-display text-lg font-semibold text-foreground">{favourites.length} saved</div></div>
            <Heart className="size-5 text-deal" />
          </div>
          {favourites.length === 0 ? (
            <p className="text-sm text-steel">Save phones from the shop with the heart button and they'll appear here.</p>
          ) : (
            <div className="space-y-3">
              {favourites.map((product) => (
                <Link key={product.id} to="/product/$slug" params={{ slug: product.slug }} className="flex items-center gap-3 rounded-2xl border border-hair p-3 hover:border-electric/40">
                  <img src={product.images[0]} alt={product.name} className="size-14 rounded-xl bg-panel object-cover" />
                  <span className="min-w-0 flex-1"><span className="block truncate font-display font-semibold text-foreground">{product.name}</span><span className="text-xs text-steel">{ksh(product.price)}</span></span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="glass rounded-3xl p-6">
          <div className="label-mono">Saved addresses</div>
          <form onSubmit={saveAddress} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Label e.g. Home" value={address.label} onChange={(e) => setAddress((a) => ({ ...a, label: e.target.value }))} />
              <input className="field" placeholder="Town / area" value={address.location} onChange={(e) => setAddress((a) => ({ ...a, location: e.target.value }))} />
            </div>
            <input className="field" placeholder="Estate, street, building" value={address.address} onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))} />
            <button className="btn-ghost px-4 py-2.5 text-xs" type="submit"><Plus className="size-4" /> Add address</button>
          </form>
          {addresses.length > 0 && (
            <div className="mt-4 space-y-2">
              {addresses.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-hair p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-electric" />
                  <div className="min-w-0 flex-1"><div className="text-sm font-medium text-foreground">{item.label}</div><div className="text-xs text-steel">{[item.address, item.location].filter(Boolean).join(" · ")}</div></div>
                  <button onClick={() => removeAddress(item.id)} className="text-steel hover:text-deal" aria-label={"Remove " + item.label}><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="glass mt-6 rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <Package className="size-5 text-electric" />
          <div><div className="label-mono">Orders</div><div className="font-display text-lg font-semibold text-foreground">{orders.length} order{orders.length === 1 ? "" : "s"}</div></div>
        </div>
        {orders.length === 0 ? (
          <Empty title="No orders yet" hint="Your completed checkouts will appear here." />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} to="/order/$id" params={{ id: order.id }} className="block rounded-2xl border border-hair p-4 hover:border-electric/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-electric">{order.id}</span>
                  <span className="rounded-full bg-electric/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-electric">{order.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-foreground">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span><span className="font-display font-bold text-foreground">{ksh(order.total)}</span></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
