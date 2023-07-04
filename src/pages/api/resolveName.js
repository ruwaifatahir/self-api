import { Contract, ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { selfNftAbi } from "../../abi/selfNftAbi";
import { createGatewayLink } from "../../utils/helpers";

const selfNftAddress = "0x3d1d847Ebddb67DE302FfdC43FE5A68931E6b346";
const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const selfNft = new Contract(selfNftAddress, selfNftAbi, provider);

export default async function handler(req, res) {
  const { name, chain } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Please provide a name" });
  }

  const hashedName = BigInt(keccak256(toUtf8Bytes(name))).toString();

  try {
    const resolvedAddress = await selfNft.ownerOf(hashedName);
    const tokenUri = await selfNft.tokenURI(hashedName);

    const response = await fetch(`${createGatewayLink(tokenUri)}`);

    const metadata = await response.json();
    console.log("metadata", metadata);

    if (chain) {
      const chainAddress = metadata.foreignAddresses?.[chain].address;
      console.log("chainAddress", chainAddress);
      if (chainAddress) {
        return res.status(200).json({
          name,
          hashedName,
          [chain]: chainAddress,
        });
      } else {
        return res
          .status(404)
          .json({ message: `No address found for chain '${chain}'` });
      }
    } else {
      return res.status(200).json({
        name: name,
        hashedName,
        resolvedAddress,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Something went wrong while resolving name" });
  }
}
