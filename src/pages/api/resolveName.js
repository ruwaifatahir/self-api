import { Contract, ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { selfNftAbi } from "../../abi/selfNftAbi";
import { createGatewayLink } from "../../utils/helpers";

const selfNftAddress = "0x125Bb13F77f3565d421bD22e92aaFfC795D97a72";
const rpcUrl = "https://rpc.ankr.com/bsc ";

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const selfNft = new Contract(selfNftAddress, selfNftAbi, provider);

export default async function handler(req, res) {
  const { name, chain } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Please provide a name" });
  }

  const hashedName = BigInt(keccak256(toUtf8Bytes(name))).toString();

  try {
    let resolvedAddress;
    try {
      resolvedAddress = await selfNft.ownerOf(hashedName);
    } catch (error) {
      return res.status(400).json({ message: "Name is not registered yet." });
    }

    const tokenUri = await selfNft.tokenURI(hashedName);

    console.log("tokenUri", tokenUri);

    if (chain) {
      const response = await fetch(`${createGatewayLink(tokenUri)}`);

      const metadata = await response.json();

      const chainAddress = metadata.foreignAddresses?.[chain].address;
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
