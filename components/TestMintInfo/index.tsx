import React, { useState } from 'react'
import { motion } from "framer-motion"
import { urlFor } from '../../sanity'
import { Collection } from '../../typings'
import { useTypewriter } from "react-simple-typewriter"
import toast from 'react-hot-toast'




interface Props {
    collection: Collection
    amountLoading: boolean
    mintedAmount: number
    totalSupply: number
    availableMintChecking: boolean
    availableToMintAmount: number
    address?: string | null
    setTxHash: Function
    txHash?: string | null
    mintFee: number
    userAlreadyMinted: number
}

const TestMintInfo = ({ userAlreadyMinted, collection, amountLoading, mintedAmount, totalSupply, availableMintChecking, availableToMintAmount, address, setTxHash, txHash, mintFee }: Props) => {
    const [amountToMint, setAmountToMint] = useState<number>(1)

    const [text, count] = useTypewriter({
        words: [
            `${collection.title}`,
        ],
        delaySpeed: 2000,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setAmountToMint(e.target.valueAsNumber)
    };
    const handleMint = async () => {
        // console.log(address);
        // Auth
        if (!address) {
            toast.error("Connect wallet first!")
            return
        }
        if (amountToMint < 1) {
            toast.error("Next time I'll burn your token")
            setAmountToMint(1)
            return
        }
        if (amountToMint > availableToMintAmount) {
            toast.error(`You can only mint ${availableToMintAmount} more!`)
            setAmountToMint(availableToMintAmount)
            return
        }
        if (amountLoading) {
            toast.error("Still loading...")
            return
        }
        if (mintedAmount === totalSupply) {
            toast.error("Minted out")
            return
        }


        // Generate a transaction
        const payload = {
            type: "entry_function_payload",
            function: "0x481efbf0c3cbec627b5f5674287d4ae6ee770da5949dcfe698a8520108236a33::candy_machine_v2::mint_tokens",
            type_arguments: [],
            arguments: [
                "0x318a92358a1867a1c7c7fbc98d98a151cd54ea59bc75a715554406bbf64cde2e",
                "Aptos Yetis",
                amountToMint,
            ]
        };
        // console.log(payload)

        const transaction = await window.martian.generateTransaction(address, payload);
        const txnHash = await window.martian.signAndSubmitTransaction(transaction);

        setTxHash(txnHash)
        // console.log(txnHash);
    }

    return (
        <div className='flex flex-2 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0 py-2'>
            <img className='w-80 object-cover lg:h-100 rounded-xl'
                src={urlFor(collection?.mainImage).url()}
            />
            <h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold py-5 text-[#ecdcdc]'>
                {text}
            </h1>
            {/* <p className='pt-2 text-xl text-green-500'>13/21 Claimed</p> */}
            <h2 className=" text-sm uppercase text-white pb-2 tracking-[5px] md:tracking-[5px] py-5">
                {amountLoading ? (
                    <div className='justify-center items-center'>
                        <h1 className='animate-pulse'>&nbsp;Loading supply count...</h1>
                    </div>
                ) : (
                    <div>{mintedAmount}/{totalSupply}</div>
                )}
            </h2>
            {(availableMintChecking) ? (
                <div className='text-white font-bold animate-pulse py-3'>
                    Checking your status...
                </div>) : ((availableToMintAmount === 0) ? (
                    <div className='py-2 text-white font-semibold text-lg sm:py-5'>
                        You already minted {userAlreadyMinted}
                    </div>
                ) : (
                    <div>
                        <div className='text-white py-3 font-semibold text-lg'>You already minted {userAlreadyMinted}</div>
                        <div className='text-white py-3 font-semibold text-lg'>You can mint {(availableToMintAmount >= (totalSupply - mintedAmount)) ? (totalSupply - mintedAmount) : (availableToMintAmount)} !</div>
                        <div className='py-5 space-x-2 flex'>
                            <input
                                type="number"
                                onChange={handleChange}
                                value={amountToMint}
                                placeholder='Amount to mint'
                                className="text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 items-center"
                            />
                            <motion.div
                                whileTap={{
                                    scale: 0.8,
                                    rotate: 0,
                                    borderRadius: "100%"
                                }}>
                                <button onClick={handleMint}
                                    className="text-white bg-[#0e3839] rounded-lg px-4 py-2 font-semibold"
                                >Mint {amountToMint ? amountToMint : 1} for {mintFee * amountToMint ? mintFee * amountToMint : mintFee} APT</button>
                            </motion.div>
                        </div>
                    </div>
                    // )
                ))}

            {/* If TxHash */}
            {txHash ? (
                <div>
                    <div className='py-5 text-white font-bold text-lg'>&nbsp;Successfully minted {amountToMint}!</div>
                    <a target='_blank' href={`https://explorer.aptoslabs.com/txn/${txHash}`} >
                        <div className='text-white font-bold animate-pulse py-3'>
                            &nbsp;Click to check your transaction
                        </div>
                    </a>
                </div>
            ) : null}
        </div>
    )
}

export default TestMintInfo