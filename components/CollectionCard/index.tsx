import Link from 'next/link'
import React from 'react'
import { urlFor } from '../../sanity'
import { Collection } from '../../typings'

type Props = { collection: Collection }

const CollectionCard = ({ collection }: Props) => {
    return (
        <div className=''>
            <Link href={`/nft/${collection.slug.current}`}>
                <div className='flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105'>
                    <div className='bg-gradient-to-br from-cyan-500 to-blue-500 p-1 md:p-1 rounded-xl'>
                        <img className='h-60 w-50 sm:h-96 sm:w-65 rounded-2xl object-cover'
                            src={urlFor(collection.mainImage).url()}
                            alt='' />
                    </div>
                    <div className='p-5'>
                        <h2 className='text-xl md:text-3xl font-semibold text-white'>{collection.title}</h2>
                    </div>
                    <p className='mt-2 text-sm font-extralight text-white'>{collection.description}</p>
                </div>
            </Link>
        </div >
    )
}

export default CollectionCard