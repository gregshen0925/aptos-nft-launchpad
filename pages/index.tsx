import type { GetServerSideProps, GetStaticProps } from "next";
import Head from "next/head";
import CollectionCard from "../components/CollectionCard";
import { sanityClient } from "../sanity";
import { Collection } from "../typings";
import { motion } from "framer-motion";

interface Props {
  collections: Collection[];
}

const Home = ({ collections }: Props) => {
  return (
    <div className="py-8 mx-auto flex min-h-screen flex-col md:py-20 md:px-10 2xl:px-0 bg-black">
      <Head>
        <title>InJoy Labs Aptos NFT Launchpad</title>
      </Head>

      <h1 className="px-6 md:px-20 mb-10 text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#11bbca] to-[#036e30] ">
        <p className="font-extrabold ">InJoy Labs</p>
        <p className="text-xl md:text-2xl">Aptos NFT Launchpad</p>
      </h1>
      <div className="px-10">
        <main className="bg-gradient-to-r from-[#051818] to-[#0e3839] p-10 shadow-xl shadow-[#0e3839]/80 rounded-lg">
          <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 space-y-15">
            {collections
              ?.sort((a, b) =>
                (a.mintStartTime
                  ? a.mintStartTime
                  : "2050-02-12T09:15:00Z"
                ).localeCompare(
                  b.mintStartTime ? b.mintStartTime : "2050-02-12T09:15:00Z"
                )
              )
              .map((collection, i) => (
                <motion.div
                  whileTap={{
                    scale: 0.8,
                    rotate: 0,
                    borderRadius: "100%",
                  }}
                  key={i}
                  className="py-4"
                >
                  <CollectionCard collection={collection} />
                </motion.div>
              ))}
          </div>
        </main>
      </div>
      <div className="justify-center py-20 text-center">
        <h3 className="text-white font-semibold px-8">
          We do no provide doxxing service at the moment. Please DYOR and mint
          with caution
        </h3>
        <a target="_blank" href="https://twitter.com/acidmonkeys">
          <h3 className="text-white py-5">Powered by InJoy Labs</h3>
        </a>
      </div>
    </div>
  );
};

export default Home;

// export const getStaticProps: GetStaticProps<Props> = async () => {
//   const collections: Collection[] = await fetchCollections()

//   return {
//     props: {
//       collections,
//     },
//     revalidate: 10,
//   }
// }

export const getServerSideProps: GetServerSideProps = async () => {
  console.log("start querying");
  const query = `*[_type=="collection"]{
    _id,
    title,
    address,
    description,
    mintStartTime,
    souffl3Url,
    topazUrl,
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

  const collections = await sanityClient.fetch(query);
  console.log(collections);
  return {
    props: {
      collections,
    },
  };
};
