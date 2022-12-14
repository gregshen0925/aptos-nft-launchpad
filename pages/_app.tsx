import '../styles/globals.css'
import '../styles/Style.scss'
import type { AppProps } from 'next/app'
import {
  WalletAdapterNetwork,
  MartianWalletAdapter,
  AptosWalletAdapter,
  RiseWalletAdapter,
  FewchaWalletAdapter,
  WalletProvider,
  PontemWalletAdapter,
  SpikaWalletAdapter,
  BitkeepWalletAdapter,
  BloctoWalletAdapter
} from '@manahippo/aptos-wallet-adapter';
import { useMemo } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      new BloctoWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new RiseWalletAdapter(),
      new FewchaWalletAdapter(),
      new PontemWalletAdapter(),
      new SpikaWalletAdapter(),
      new BitkeepWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      onError={(error: Error) => {
        console.log('wallet errors: ', error);
      }}>
      <Component {...pageProps} />
    </WalletProvider>
  )
}

export default MyApp