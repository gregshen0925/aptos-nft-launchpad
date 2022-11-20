import React, { useState } from "react";
import { motion } from "framer-motion";
import { urlFor } from "../../sanity";
import { Types } from "aptos";
import { Collection } from "../../typings";
import { useTypewriter } from "react-simple-typewriter";
import toast from "react-hot-toast";
import { AptosClient } from "aptos";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

interface Props {
  collection: Collection;
  amountLoading: boolean;
  mintedAmount: number;
  totalSupply: number;
  availableMintChecking: boolean;
  availableToMintAmount: number;
  setTxHash: Function;
  txHash?: string | null;
  mintFee: number;
  userAlreadyMinted: number;
}

const MintInfo = ({
  userAlreadyMinted,
  collection,
  amountLoading,
  mintedAmount,
  totalSupply,
  availableMintChecking,
  availableToMintAmount,
  setTxHash,
  txHash,
  mintFee,
}: Props) => {
  const [amountToMint, setAmountToMint] = useState<number>(1);
  const [txLoading, setTxLoading] = useState({
    sign: false,
    transaction: false,
    faucet: false,
  });
  const {
    account,
    signAndSubmitTransaction,
    connected,
    wallet: currentWallet,
    signMessage,
    signTransaction,
  } = useWallet();

  const [text, count] = useTypewriter({
    words: [`${collection.title}`],
    delaySpeed: 2000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmountToMint(e.target.valueAsNumber);
  };
  const handleMint = async () => {
    // console.log(address);
    // Auth
    if (!connected) {
      toast.error("Connect wallet first!");
      return;
    }
    if (amountToMint < 1) {
      toast.error("Next time I'll burn your token");
      setAmountToMint(1);
      return;
    }
    if (amountToMint > availableToMintAmount) {
      toast.error(`You can only mint ${availableToMintAmount} more!`);
      setAmountToMint(availableToMintAmount);
      return;
    }
    if (amountLoading) {
      toast.error("Still loading...");
      return;
    }
    if (mintedAmount === totalSupply) {
      toast.error("Minted out");
      return;
    }
    // const txOptions = {
    //     max_gas_amount: '1000',
    //     gas_unit_price: '1'
    //   };

    // Generate a transaction
    if (account?.address || account?.publicKey) {
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: `${collection.moduleId}::mint_tokens`,
        type_arguments: [],
        arguments: [
          `${collection.creator.address}`,
          `${collection.nftCollectionName}`,
          amountToMint,
        ],
      };
      const transactionRes = await signAndSubmitTransaction(
        payload
        // txOptions
      );
      const client = new AptosClient(
        "https://fullnode.mainnet.aptoslabs.com/v1"
      );
      await client.waitForTransaction(transactionRes?.hash || "");

      setTxHash(transactionRes?.hash);
    }
  };

  const fixedMintFee = Number((mintFee * 0.97).toFixed(2));

  return (
    <div className="flex flex-2 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0 py-2">
      <img
        className="w-80 object-cover lg:h-100 rounded-xl"
        src={urlFor(collection?.mainImage).url()}
      />
      <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold py-5 text-[#ecdcdc]">
        {text}
      </h1>
      <h2 className=" text-sm uppercase text-white pb-2 tracking-[5px] md:tracking-[5px] py-5">
        {amountLoading ? (
          <div className="justify-center items-center">
            <h1 className="animate-pulse">&nbsp;Loading supply count...</h1>
          </div>
        ) : (
          <div>
            {mintedAmount}/{totalSupply}
          </div>
        )}
      </h2>
      {mintedAmount != 0 && mintedAmount == totalSupply ? (
        <div className="py-5 text-2xl font-bold text-white">Sold out!!</div>
      ) : availableMintChecking ? (
        <div className="text-white font-bold animate-pulse py-3">
          Checking your status...
        </div>
      ) : availableToMintAmount === 0 ? (
        <div className="py-2 text-white font-semibold text-lg sm:py-5">
          Already minted {userAlreadyMinted}, can't mint now
        </div>
      ) : (
        <div>
          <div className="text-white py-3 font-semibold text-lg">
            You already minted {userAlreadyMinted}
          </div>
          <div className="text-white py-3 font-semibold text-lg">
            You can mint{" "}
            {availableToMintAmount >= totalSupply - mintedAmount
              ? totalSupply - mintedAmount
              : availableToMintAmount}{" "}
            !
          </div>
          <div className="py-5 space-x-2 flex">
            <input
              type="number"
              onChange={handleChange}
              value={amountToMint}
              placeholder="Amount to mint"
              className="text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 items-center"
            />
            <motion.div
              whileTap={{
                scale: 0.8,
                rotate: 0,
                borderRadius: "100%",
              }}
            >
              <button
                onClick={handleMint}
                className="text-white bg-[#0e3839] rounded-lg px-4 py-2 font-semibold"
              >
                Mint {amountToMint ? amountToMint : 1} for{" "}
                {fixedMintFee * amountToMint
                  ? fixedMintFee * amountToMint
                  : fixedMintFee}{" "}
                APT
              </button>
            </motion.div>
          </div>
        </div>
        // )
      )}

      {/* If TxHash */}
      {txHash ? (
        <div>
          <div className="py-5 text-white font-bold text-lg">
            &nbsp;Successfully minted {amountToMint}!
          </div>
          <a
            target="_blank"
            href={`https://explorer.aptoslabs.com/txn/${txHash}`}
          >
            <div className="text-white font-bold animate-pulse py-3">
              &nbsp;Click to check your transaction
            </div>
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default MintInfo;
