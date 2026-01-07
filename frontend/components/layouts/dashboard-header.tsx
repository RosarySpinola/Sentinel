"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  LogOut,
  Copy,
  ExternalLink,
  Menu,
  Mail,
  Loader2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMoveBalance } from "@/lib/hooks/use-move-balance";
import { useNetwork } from "@/lib/contexts/network-context";
import { MOVEMENT_NETWORKS, NetworkType } from "@/lib/constants/networks";

export function DashboardHeader() {
  const { user, isAuthenticated, logout, walletAddress } = useAuth();
  const { formatted: balance, isLoading: isBalanceLoading } =
    useMoveBalance(walletAddress);
  const { network, setNetwork, networkConfig } = useNetwork();

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
    <header className="border-border bg-card flex h-16 items-center justify-between border-b px-4">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Network selector */}
        <Select
          value={network}
          onValueChange={(value: NetworkType) => setNetwork(value)}
        >
          <SelectTrigger className="w-[200px]">
            <Globe className="mr-2 h-4 w-4 shrink-0" />
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="testnet">Movement Testnet</SelectItem>
            <SelectItem value="mainnet">Movement Mainnet</SelectItem>
          </SelectContent>
        </Select>

        <ThemeToggle />

        {isAuthenticated && walletAddress ? (
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
                  href={`${networkConfig.explorer}/account/${walletAddress}`}
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
        ) : (
          <WalletSelectionModal>
            <Button>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </WalletSelectionModal>
        )}
      </div>
    </header>
  );
}
