export function createGatewayLink(ipfsLink) {
  const ipfsPrefix = "ipfs://";
  const gatewayPrefix = "https://nftstorage.link/ipfs/";

  if (ipfsLink.startsWith(ipfsPrefix)) {
    const cid = ipfsLink.substring(ipfsPrefix.length);
    const gatewayLink = gatewayPrefix + cid;
    return gatewayLink;
  }

  // If the input doesn't start with "ipfs://", return null or throw an error as desired
  return undefined;
}
