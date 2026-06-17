"use client";

import { Share2, MessageCircle, Mail, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ShareButton({ title, url }: { title: string; url: string }) {
  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // el usuario canceló el share, no hacemos nada
      }
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(`${title}: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleEmail() {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${title}\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  }

  const canNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Share2 className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {canNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="size-4" />
            Compartir...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleWhatsApp}>
          <MessageCircle className="size-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="size-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="size-4" />
          Copiar enlace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
