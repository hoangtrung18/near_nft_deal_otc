# Hello NEAR Contract

The smart contract exposes two methods to enable storing and retrieving a greeting in the NEAR network.

```ts
@NearBindgen({})
class HelloNear {
  greeting: string = "Hello";

  @view // This method is read-only and can be called for free
  get_greeting(): string {
    return this.greeting;
  }

  @call // This method changes the state, for which it cost gas
  set_greeting({ greeting }: { greeting: string }): void {
    // Record a log permanently to the blockchain!
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }
}
```

<br />

# Quickstart

1. Make sure you have installed [node.js](https://nodejs.org/en/download/package-manager/) >= 16.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />


## 1. Build and Deploy the Contract
1. Build
```bash
npm run build
```
2. Create account for contract to deploy on near testnet

```bash
near create-account swap-contract.YOUR_WALLET_ID.testnet --masterAccount YOUR_WALLET_ID.testnet --initialBalance 10
```

3. Deploy your contract has build to testnet 
You can deploy the contract has build in the NEAR testnet by running:

```bash
near deploy --accountId swap-contract.YOUR_WALLET_ID.testnet --wasmFile build/nft.wasm
```

Once finished, check the `swap-contract.YOUR_WALLET_ID.testnet` address in which the contract was deployed:

<br />

## 2. Init contract test

Before use contract, we need to init to assign storage address and owner 

```bash
# Init address
near call swap-contract.YOUR_WALLET_ID.testnet init '{"owner_id": "swap-contract.YOUR_WALLET_ID.testnet"}' --accountId swap-contract.YOUR_WALLET_ID.testnet
```

<br />

## 3.Review and try some test 

```bash
# Create deal
near call swap-example.tny.testnet create_deal '{"taker_address": "dark2.testnet", "zero_for_maker": true, "amount": 0, "maker_nfts": {"tokenId":"token-1", "nftAddress": "nft-example.tny.testnet"}, "taker_nfts": {"tokenId":"token-2", "nftAddress": "nft-example.tny.testnet"} }' --accountId tny.testnet --amount 0.1
```

```bash
# Check nft
near view nft-contract.YOUR_WALLET_ID.testnet '{"token_id":"token-1")'
```

```bash
# Transfer nft
near call nft-contract.YOUR_WALLET_ID.testnet '{"token_id": "token-2", "receiver_id": "YOUR_WALLET_ID2.testnet",  "approval_id": "YOUR_WALLET_ID.testnet" }' --accountId YOUR_WALLET_ID.testnet --depositYocto 1 
```