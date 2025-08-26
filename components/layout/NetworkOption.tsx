import React from "react";
import { Button } from "@/components/ui/button";
import type { Network } from "@/types/coredao";

type NetworkSelectorProps = {
  address: string;
  onSelect: (network: Network) => void;
};

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ address, onSelect }) => {
  return (
    <div className="w-full max-w-md bg-[#1c1c1c] border border-white/10 rounded-xl p-4 shadow-md">
      <p className="text-sm text-gray-300 mb-3">
        Please choose a network to verify:
      </p>

      <div className="bg-black/60 text-gray-200 font-mono text-xs p-2 rounded-lg mb-4 overflow-hidden text-ellipsis">
        {address}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onSelect("mainnet")}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg py-2 shadow hover:opacity-90 transition"
        >
          🌐 Core Mainnet
        </Button>
        <Button
          onClick={() => onSelect("testnet2")}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg py-2 shadow hover:opacity-90 transition"
        >
          🧪 Core Testnet
        </Button>
      </div>
    </div>
  );
};

export default NetworkSelector;
