import { AccountId } from "near-sdk-js/lib/types";
import { assert, bytes, near } from "near-sdk-js";
import { Contract, DELIMETER } from ".";
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;
export function transfer_nft({
  contract,
  to,
  nftAddress,
  approvalId,
  tokenId,
}: {
  contract: Contract;
  to: AccountId;
  nftAddress: string;
  approvalId: number;
  tokenId: string;
}): boolean {
  const promise = near.promiseBatchCreate(nftAddress);
  const deal = near.promiseBatchActionFunctionCall(
    promise,
    "nft_transfer",
    bytes(
      JSON.stringify({
        receiver_id: to, //purchaser (person to transfer the NFT to)
        token_id: tokenId, //token ID to transfer
        approval_id: approvalId, //market contract's approval ID in order to transfer the token on behalf of the owner
        memo: "swap nft",
      })
    ),
    1, // 1 yoctoNEAR
    GAS_FOR_NFT_TRANSFER
  );
  return true;
}
