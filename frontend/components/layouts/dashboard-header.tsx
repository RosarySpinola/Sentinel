"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, Menu, User } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";

export function DashboardHeader() {
  const { account, connected, disconnect, network } = useWallet();

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      toast.success("Address copied to clipboard");
    }
  };

  const shortenAddress = (address: string | { toString: () => string }) => {
    const addr = typeof address === "string" ? address : address.toString();
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = () => {
    if (network?.chainId === 126) return "Mainnet";
    if (network?.chainId === 250) return "Testnet";
    return "Unknown";
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Network badge */}
      <div className="hidden lg:flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {getNetworkName()}
        </Badge>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {connected && account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="font-mono text-sm">
                  {shortenAddress(account.address)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Connected Wallet</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {shortenAddress(account.address)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAddress}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://explorer.movementnetwork.xyz/account/${account.address}?network=${getNetworkName().toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => disconnect()}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <WalletSelectionModal>
            <Button>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </WalletSelectionModal>
        )}

        {/* User authentication */}
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
