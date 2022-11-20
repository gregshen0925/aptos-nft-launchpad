import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { sanityClient } from "../../sanity";
import { Collection } from "../../typings";
import { AptosClient, TokenClient } from "aptos";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Countdown from "../../components/Countdown/index";
import Header from "../../components/Header";
import ProjectInfo from "../../components/ProjectInfo";
import MintInfo from "../../components/MintInfo";
import ConnectModal from "../../components/ConnectModal";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

type Props = {
  collection: Collection;
};

const NFTDropPage = ({ collection }: Props) => {
  const [address, setAddress] = useState<string | null | undefined>(null);
  const [mintedAmount, setMintedAmount] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [amountLoading, setAmountLoading] = useState<boolean>(true);
  const [mintFee, setMintFee] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>();
  const [availableToMintAmount, setAvailableToMintAmount] = useState<number>(0);
  const [availableMintChecking, setAvaiableMintChecking] =
    useState<boolean>(true);
  const [publicStartTime, setPublicStartTime] = useState<number>(0);
  const [presaleStartTime, setPresaleStartTime] = useState<number>(0);
  const [countDays, setCountDays] = useState<number>(0);
  const [countHours, setCountHours] = useState<number>(0);
  const [countMinutes, setCountMinutes] = useState<number>(0);
  const [countSeconds, setCountSeconds] = useState<number>(0);
  const [presaleStage, setPresaleStage] = useState<boolean>(false);
  const [publicStage, setPublicStage] = useState<boolean>(false);
  const [userAlreadyMinted, setUserAlreadyMinted] = useState<number>(0);
  const [connectModalOn, setConnectModalOn] = useState<boolean>(false);

  // Click outside to close modal ref

  const {
    autoConnect,
    connect,
    disconnect,
    account,
    wallets,
    signAndSubmitTransaction,
    connecting,
    connected,
    disconnecting,
    wallet: currentWallet,
    signMessage,
    signTransaction,
  } = useWallet();

  useEffect(() => {
    setAddress(account?.address?.toString());
    console.log(account);
  }, [connected]);

  useEffect(() => {
    const fetchNFTDropData = async () => {
      setAmountLoading(true);
      setAvaiableMintChecking(true);
      // const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1")
      const client = new AptosClient(
        "https://fullnode.mainnet.aptoslabs.com/v1"
      );
      const tokenClient = new TokenClient(client);

      const resourceAccount = collection.resourceAccount;
      const collectionName = collection.nftCollectionName;

      if (!resourceAccount && !collectionName) {
        setPresaleStartTime(new Date(collection.mintStartTime).valueOf());
        return;
      }
      const data = await tokenClient.getCollectionData(
        resourceAccount,
        collectionName
      );

      const { description, maximum, name, supply: minted_supply, uri } = data;

      setMintedAmount(minted_supply);
      setTotalSupply(maximum);

      setAmountLoading(false);

      if (!address) {
        const { presale_mint_time, public_mint_time } =
          await client.getTableItem(collection.collection_configs, {
            key_type: "0x1::string::String",
            value_type: `${collection.moduleId}::CollectionConfig`,
            key: collectionName,
          });

        setPresaleStartTime(presale_mint_time * 1000);
        setPublicStartTime(public_mint_time * 1000);
        return;
      } else {
        const {
          max_supply_per_user,
          supply_per_wl: { handle: spw_handle },
          mints_per_user: { handle: mpu_handle },
          mint_fee_per_mille,
          presale_mint_time,
          public_mint_time,
        } = await client.getTableItem(collection.collection_configs, {
          key_type: "0x1::string::String",
          value_type: `${collection.moduleId}::CollectionConfig`,
          key: collectionName,
        });

        setMintFee(mint_fee_per_mille / 100000000);
        setPresaleStartTime(presale_mint_time * 1000);
        setPublicStartTime(public_mint_time * 1000);

        const user_max_supply = await client
          .getTableItem(spw_handle, {
            key_type: "address",
            value_type: "u64",
            key: address,
          })
          .then((wl_max) => (publicStage ? max_supply_per_user : wl_max))
          .catch(() => (publicStage ? max_supply_per_user : 0));

        const user_minted_amount = await client
          .getTableItem(mpu_handle, {
            key_type: "address",
            value_type: "u64",
            key: address,
          })
          .then((mintedAmount) => mintedAmount)
          .catch(() => 0);

        setAvailableToMintAmount(user_max_supply - user_minted_amount);
        setAvaiableMintChecking(false);
        setUserAlreadyMinted(user_minted_amount);
      }
    };

    fetchNFTDropData();
  }, [address, txHash, publicStage]);

  // Auth

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10 overflow-y-scroll">
      <Head>
        <title>{collection.title} Mint Page</title>
      </Head>
      <Toaster position="bottom-center" />

      {/* Left */}
      <div className="lg:col-span-4 bg-gradient-to-r from-[#051818] to-[#0e3839] pr-5 pl-5">
        <Header setConnectModalOn={setConnectModalOn} />
        {connectModalOn ? (
          <ConnectModal setConnectModalOn={setConnectModalOn} />
        ) : null}

        <ProjectInfo collection={collection} />
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6 bg-black">
        {/* Countdown */}
        <div className="text-semibold">
          {!presaleStage && !publicStage ? (
            <div className="text-lg text-white flex justify-center text-center font-semibold">
              Presale Starts In
            </div>
          ) : null}
          {presaleStage ? (
            <div>
              <div className="text-lg text-white flex justify-center text-center font-semibold">
                Presale Starts!
              </div>
              <div className="text-lg text-white flex justify-center text-center font-semibold">
                Public Starts In
              </div>
            </div>
          ) : null}
          {publicStage ? (
            <div className="text-lg text-white flex justify-center text-center font-semibold">
              Public Starts!
            </div>
          ) : null}

          <div className="flex py-10 justify-center">
            <Countdown
              presaleStartTime={presaleStartTime}
              publicStartTime={publicStartTime}
              countDays={countDays}
              countHours={countHours}
              countMinutes={countMinutes}
              countSeconds={countSeconds}
              setCountDays={setCountDays}
              setCountHours={setCountHours}
              setCountMinutes={setCountMinutes}
              setCountSeconds={setCountSeconds}
              setPresaleStage={setPresaleStage}
              setPublicStage={setPublicStage}
            />
          </div>
        </div>

        {/* RightContent */}
        <MintInfo
          collection={collection}
          amountLoading={amountLoading}
          mintedAmount={mintedAmount}
          totalSupply={totalSupply}
          availableMintChecking={availableMintChecking}
          availableToMintAmount={availableToMintAmount}
          setTxHash={setTxHash}
          txHash={txHash}
          mintFee={mintFee}
          userAlreadyMinted={userAlreadyMinted}
        />
      </div>
    </div>
  );
};

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type=="collection" && title==$id][0]{
                _id,
                title,
                resourceAccount,
                collection_configs,
                mintStartTime,
                topazUrl,
                souffl3Url,
                moduleId,
                socials,
                description,
                nftCollectionName,
                mainImage{
                asset
            },
            previewImage{
                asset
            },

            creator->{
                _id,
                name,
                address,
                slug  {
                current
            },
        }
      }`;

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });
  if (!collection) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      collection,
    },
  };
};
