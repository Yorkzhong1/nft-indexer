import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

 //here connect to metamask
  async function connect() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if(accounts.length===0){
      alert('Please connect to metamask')
    }else{
    setUserAddress(accounts[0]);
    document.getElementById("useraddress").value=accounts[0];
    console.log(userAddress)}
  }

  async function getNFTsForOwner() {
    document.getElementById('display1').innerHTML=`<h2 my={36}>Connecting to blockchain...</h2>`
    let regex1=/^0x[a-fA-F0-9]{40}$/
    let regex2=/[a-fA-F0-0]*.eth/
    let check1=regex1.test(userAddress)
    let check2=regex2.test(userAddress)// check whether the input is eth address or ENS domain name
    console.log(check2)
    if(!check1&&!check2){
        document.getElementById('display1').innerHTML=`<h2  my={36}>Incorrect address, please input again.</h2>`
    }

    const config = {
      apiKey: 'g75pF2eTt7uuz_YgGRYvMTHu5LLxOvOQ',
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    if(check2){
      const add=await alchemy.core.resolveName(userAddress);
      setUserAddress(add)
    }
    

    const data = await alchemy.nft.getNftsForOwner(userAddress);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
        data.ownedNfts[i].contract.address,
        data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);

    document.getElementById('display1').innerHTML=`<h2 my={36}> Here are your NFTs:</h2>`
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          id="useraddress"
        />
        <Flex>
          <Button fontSize={20} textAlign="center" type="button" onClick={
          ()=>{
            connect()
          }
          } ml="10px" mt="10px" bgColor="lightgreen" >
          Connecting to Web3
        </Button>
        <Button fontSize={20} onClick={getNFTsForOwner}  ml="10px" mt="10px" bgColor="lightgreen">
          Fetch NFTs
        </Button>
        </Flex>
        <div id='display1'></div>

        

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Name:</b> {tokenDataObjects[i].title}&nbsp;
                  </Box>
                  <Image src={tokenDataObjects[i].rawMetadata.image} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
