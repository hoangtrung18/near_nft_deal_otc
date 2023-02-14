import { assert, near, UnorderedSet } from "near-sdk-js";
import { Contract, DELIMETER } from ".";
// import { Sale } from "./sale";

// export function restoreOwners(collection) {
//   if (collection == null) {
//     return null;
//   }
//   return UnorderedSet.serialize(collection as UnorderedSet);
// }

//used to make sure the user attached exactly 1 yoctoNEAR
export function assertOneYocto() {
  assert(
    near.attachedDeposit().toString() === "1",
    "Requires attached deposit of exactly 1 yoctoNEAR"
  );
}

// //get the number of sales for an nft contract. (returns a string)
// export function internalSupplyByNftContractId({
//   contract,
//   nftContractId,
// }: {
//   contract: Contract;
//   nftContractId: string;
// }): string {
//   //get the set of tokens for associated with the given nft contract
//   let byNftContractId = restoreOwners(
//     contract.byNftContractId.get(nftContractId)
//   );
//   //if there as some set, we return the length but if there wasn't a set, we return 0
//   if (byNftContractId == null) {
//     return "0";
//   }

//   return byNftContractId.len().toString();
// }
