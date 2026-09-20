import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MapPin, Package, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { useStore } from "@/lib/store";
import { ksh } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Market Rise Digital" },
      { name: "description", content: "Manage your Market Rise Digital profile, addresses, favourites and customer order history." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Account | Market Rise Digital" },
      { property: "og:description", content: "Profile, favourites, addresses and orders." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const {
    wishlist,
    products,
    orders,
    addresses,
    addAddress,
    removeAddress,
    updateProfile: updateStoreProfile,
  } = useStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [address, setAddress] = useState({ label: "", location: "", address: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: profile?.full_name || user.user_metadata?.full_name || "",
      phone: profile?.phone || user.user_metadata?.phone || "",
    });
  }, [user, profile]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!profileForm.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setSavingProfile(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profileForm.name.trim(),
      email: user.email ?? profile?.email ?? "",
      phone: profileForm.phone.trim(),
    });

    if (error) {
      toast.error("We couldn't save your profile. Please try again.");
      setSavingProfile(false);
      return;
    }

    await refreshProfile();
    updateStoreProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      email: user.email ?? profile?.email ?? "",
      signedIn: true,
    });
    setEditingProfile(false);
    setSavingProfile(false);
    toast.success("Profile updated.");
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

  if (loading) {
    return (
      <Page>
        <PageTitle eyebrow="Account" title="Your account" />
        <div className="glass h-64 rounded-3xl" />
      </Page>
    );
  }

  if (!user) {
    return (
      <Page className="flex min-h-[70vh] items-center justify-center">
        <div className="glass w-full max-w-md rounded-3xl p-7 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-electric/10">
            <UserRound className="size-6 text-electric" />
          </div>
          <div className="label-mono mt-5">Customer account</div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Sign in to your account</h1>
          <p className="mt-2 text-sm text-steel">
            View your orders, track deliveries, keep your wishlist and save delivery addresses.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <a href="/auth?mode=signin" className="btn-electric px-5 py-3 text-sm">
              Sign in
            </a>
            <a href="/auth?mode=signup" className="btn-ghost px-5 py-3 text-sm">
              Create account
            </a>
          </div>
          <Link to="/shop" className="mt-4 inline-block text-xs text-steel hover:text-electric">
            Continue shopping
          </Link>
        </div>
      </Page>
    );
  }

  const favourites = wishlist
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const displayName = profile?.full_name || profileForm.name || "Customer";
  const email = profile?.email || user.email || "";

  return (
    <Page>
      <PageTitle
        eyebrow="Account"
        title={"Welcome, " + (displayName.split(" ")[0] || "there")}
        subtitle="Your profile, saved addresses, favourites and customer order history."
        action={
          <button
            onClick={async () => {
              await signOut();
              toast.success("You have been signed out.");
            }}
            className="btn-ghost px-4 py-2 text-xs"
          >
            Sign out
          </button>
        }
      />

      <section className="glass rounded-3xl p-6">
        {editingProfile ? (
          <>
            <div className="label-mono mb-4">Profile</div>
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <input
                className="field"
                placeholder="Full name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                className="field"
                type="tel"
                placeholder="Phone number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <input className="field sm:col-span-2" value={email} readOnly aria-label="Account email" />
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" disabled={savingProfile} className="btn-electric px-5 py-2.5 text-sm">
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-ghost px-5 py-2.5 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-electric/10">
                <UserRound className="size-5 text-electric" />
              </span>
              <div>
                <div className="font-display font-semibold text-foreground">{displayName}</div>
                <div className="text-sm text-steel">{profileForm.phone || "No phone saved"}{email ? " · " + email : ""}</div>
              </div>
            </div>
            <button onClick={() => setEditingProfile(true)} className="btn-ghost px-4 py-2 text-xs">
              Edit profile
            </button>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section id="favourites" className="glass rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="label-mono">Wishlist</div>
              <div className="font-display text-lg font-semibold text-foreground">{favourites.length} saved</div>
            </div>
            <Heart className="size-5 text-deal" />
          </div>
          {favourites.length === 0 ? (
            <p className="text-sm text-steel">Save phones with the heart button and they'll appear here.</p>
          ) : (
            <div className="space-y-3">
              {favourites.map((product) => (
                <Link
                  key={product.id}
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="flex items-center gap-3 rounded-2xl border border-hair p-3 hover:border-electric/40"
                >
                  <img src={product.images[0]} alt={product.name} className="size-14 rounded-xl bg-panel object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display font-semibold text-foreground">{product.name}</span>
                    <span className="text-xs text-steel">{ksh(product.price)}</span>
                  </span>
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
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-steel">{[item.address, item.location].filter(Boolean).join(" · ")}</div>
                  </div>
                  <button onClick={() => removeAddress(item.id)} className="text-steel hover:text-deal" aria-label={"Remove " + item.label}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section id="orders" className="glass mt-6 rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <Package className="size-5 text-electric" />
          <div>
            <div className="label-mono">Orders</div>
            <div className="font-display text-lg font-semibold text-foreground">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        {orders.length === 0 ? (
          <Empty title="No orders yet" hint="Orders placed while signed in will appear here." />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to="/order/$id"
                params={{ id: order.id }}
                className="block rounded-2xl border border-hair p-4 hover:border-electric/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-electric">{order.id}</span>
                  <span className="rounded-full bg-electric/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-electric">
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-display font-bold text-foreground">{ksh(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
