"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Wallet,
  Github,
  LogOut,
  Copy,
  ExternalLink,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMoveBalance } from "@/lib/hooks/use-move-balance";
import {
  MOVEMENT_NETWORKS,
  CURRENT_NETWORK,
} from "@/components/wallet-provider";

export function LandingHeader() {
  const { user, isAuthenticated, logout, walletAddress } = useAuth();
  const { formatted: balance, isLoading: isBalanceLoading } =
    useMoveBalance(walletAddress);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard");
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Generate DiceBear pixel-art avatar URL using address as seed
  const avatarUrl = useMemo(() => {
    if (!walletAddress) return null;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${walletAddress}`;
  }, [walletAddress]);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/sentinel-logo-text.png"
            alt="Sentinel"
            width={180}
            height={44}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-foreground hover:text-foreground/80 text-sm font-medium transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-foreground hover:text-foreground/80 text-sm font-medium transition-colors"
          >
            How It Works
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-foreground/80 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && walletAddress ? (
            <div className="flex items-center gap-2">
              {/* Wallet dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 px-3">
                    {/* Balance */}
                    <span className="text-sm font-medium">
                      {isBalanceLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        `${balance} MOVE`
                      )}
                    </span>

                    {/* Divider */}
                    <div className="bg-border h-5 w-px" />

                    {/* Avatar */}
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt="Wallet avatar"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {walletAddress?.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Address */}
                    <span className="hidden font-mono text-sm sm:inline">
                      {shortenAddress(walletAddress)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Connected Wallet</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {shortenAddress(walletAddress)}
                      </p>
                      {user?.email && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={copyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`${MOVEMENT_NETWORKS[CURRENT_NETWORK].explorer}/account/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Launch App button */}
              <Button asChild>
                <Link href="/simulator">
                  Launch App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <WalletSelectionModal>
              <Button>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </WalletSelectionModal>
          )}
        </div>
      </div>
    </header>
  );
}
