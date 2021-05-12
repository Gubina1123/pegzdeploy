import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import moment from "moment";
import { API_URL } from "../../utils/constants";
import { NFT, OrderFromAPI } from "../../types";

import styles from "../../styles/asset.module.scss";
import useAsset from "../../hooks/useAsset";
import Modal from "../../components/Modal";
import Countdown from "../../components/Countdown";
import findMaxBid from "../../utils/findMaxBid";
import useOwner from "../../hooks/useOwner";
import useRelatedAssets from "../../hooks/useRelatedAssets";
import { useUser } from "../../context/UserContext";
import VideoPlayer from "../../components/VideoPlayer";
import HeadWithImage from "../../components/HeadWithImage";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import ModelViewer from "../../components/Asset/ModelViewer";

const BuyWidgetNoSsr = dynamic(() => import("../../components/BuyWidget"), {
    ssr: false,
});
const OrdersNoSsr = dynamic(() => import("../../components/Orders"), {
    ssr: false,
});
const PDFViewer = dynamic(() => import("../../components/PDFViewer"), {
    ssr: false,
});

const OrderModal: React.FC<{
    handleClose: () => void;
    buyOrders: OrderFromAPI[];
    address: string;
    tokenId: string;
    reserve: string;
}> = ({ handleClose, buyOrders, address, tokenId, reserve }) => (
    <Modal handleClose={handleClose}>
        <BuyWidgetNoSsr
            handleClose={handleClose}
            buyOrders={buyOrders}
            sellOrders={[]}
            address={address}
            tokenId={tokenId}
            reserve={reserve}
        />
    </Modal>
);

const SingleAssetPage: React.FC<{ asset: NFT }> = ({ asset }) => {
    
    const [showPdfModal, setShowPdfModal] = useState(false);
    const user = useUser();

    
    const { asset: assetData, fetchAsset } = useAsset(
        asset.address,
        asset.tokenId,
    );

    
    const [modalOpen, setModalOpen] = useState(false);

    const related = useRelatedAssets(asset);

    const salesOrder = assetData?.orders?.find((order) => order.side === 1);
    const endOfAuction = salesOrder?.closing_date
        ? moment(`${salesOrder?.closing_date}Z`).valueOf()
        : null;

    const hideMeStyle = { display: "none !important" };
    const maxBid = findMaxBid(assetData?.orders);
    const currentBid = maxBid >= Number(asset.reserve) ? maxBid : 0;
    const owner = useOwner(assetData);

    const router = useRouter();

    const handle = useFullScreenHandle();
    return (
        <main className={styles.singleAsset}>
            <HeadWithImage
                title={`${asset?.artist?.name} - ${asset.name}`}
                description={asset.description}
                imageUrl={asset.imageUrl}
            />

            <section className={styles.nft_preview}>
                <FullScreen handle={handle}>
                    <div className={styles.masthead}>
                        {/* <div
                            className={styles.imageBg}
                            style={{ backgroundImage: `url(${asset.imageUrl})` }}
                        /> */}
                        <div className={styles.assetMastHead}>
                            <button
                                className={styles.goBack}
                                onClick={
                                    handle.active
                                        ? () => handle.exit()
                                        : () => router.back()
                                }
                            >
                                <img src="/images/back-arrow.svg" alt="Back" />
                            </button>
                            <div className={styles.imageContainer}>
                                <ModelViewer src="/images/scene.glb" />
                                <button><span className={styles.singleAssetText}>01</span><input className={styles.singleAssetImage} type="image" src="/images/pegz/01creeper_icon133.png" /><span className={styles.singleAssetText}>creeper</span></button>
                            </div>
                            <button
                                type="button"
                                className={styles.fullScreen}
                                onClick={
                                    handle.active
                                        ? () => handle.exit()
                                        : () => handle.enter()
                                }
                            >
                                {handle.active ? "Close" : "FullScreen"}
                            </button>
                            <div />
                        </div>
                    </div>
                </FullScreen>
            </section>
            <section className={styles.nft_detail}>
                <div className={styles.info}>
                    <div className={styles.left}>
                        {/* <h2 className={styles.artist}>
                            <Link href={`/artist/${asset?.artist?.slug}`}>
                                <a>{asset?.artist?.name}</a>
                            </Link>
                        </h2> */}
                        
                        {/* <h2>
                            {asset?.artist?.name ? (
                                <Link href={`/artist/${asset.artist.slug}`}>
                                    <a>More Artwork From {asset.artist.name}</a>
                                </Link>
                            ) : (
                                "More works"
                            )}{" "}
                        </h2>
                        <div className={styles.relatedGrid}>
                            {related.map((token) => (
                                <div className={styles.relatedEntry}>
                                    <Link href={`/asset/${token.slug}`}>
                                        <a>
                                            <img
                                                src={token.imageUrl}
                                                alt={token.name}
                                            />
                                        </a>
                                    </Link>
                                </div>
                            ))}
                        </div> */}
                    </div>
                    <div className={styles.right}>
                        <div className={styles.centerItem}>
                            <img className={styles.pegzImage} src="/images/pegz/pegz.jpg" />
                        </div>
                        
                        <h2 className={styles.name}>Name: {asset.name}</h2>
                        
                        {asset.extraTitle && asset.extraContent && (
                            <div className={styles.extra}>
                                <h2>{asset?.extraTitle}</h2>
                                <MarkdownRenderer markdown={asset?.extraContent} />
                            </div>
                        )}

                        <div className={styles.details}>    
                            <div className={styles.auction}>
                                {asset.onSale && (
                                    <>
                                        {currentBid > 0 && (
                                            <div>
                                                <h3>Current Bid</h3>
                                                <p>{currentBid} ETH</p>
                                            </div>
                                        )}
                                        {currentBid === 0 && (
                                            <div>
                                                <h3>Reserve price</h3>
                                                <p>{asset.reserve} ETH</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {asset.onSale && (
                                    <div>
                                        <h3>Auction Ends at</h3>
                                        <p>
                                            {endOfAuction && asset.onSale ? (
                                                <Countdown date={endOfAuction} />
                                            ) : (
                                                "---"
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!asset.onSale && (
                                <button className={styles.bidButton} type="button">
                                    {asset.buttonMessage || "Coming Soon"}
                                </button>
                            )}
                            {asset.onSale && (
                                <>
                                    {user && (
                                        <>
                                            <button
                                                className={styles.bidButton}
                                                onClick={() => setModalOpen(true)}
                                                type="button"
                                            >
                                                Bid Now
                                            </button>
                                            <p>
                                                A new high bid placed under 10
                                                minutes will extend the auction by
                                                10 minutes{" "}
                                            </p>
                                            <br />
                                        </>
                                    )}

                                    {!user && (
                                        <Link href="/login">
                                            <button
                                                className={styles.bidButton}
                                                type="button"
                                            >
                                                Bid Now
                                            </button>
                                        </Link>
                                    )}
                                </>
                            )}
                        
                            <div className={styles.description}>
                                <h3>Description</h3>
                                <span>
                                    <MarkdownRenderer markdown={asset.description} />
                                </span>
                            </div>

                            {modalOpen && (
                                <OrderModal
                                    buyOrders={assetData?.orders || []}
                                    handleClose={() => {
                                        setModalOpen(false);
                                        fetchAsset();
                                    }}
                                    address={asset.address}
                                    tokenId={asset.tokenId}
                                    reserve={asset.reserve}
                                />
                            )}
                        </div>
                        <OrdersNoSsr asset={assetData} />
                        <div className={styles.owner}>
                            <h3>Owner</h3>
                            <div>
                                <span>{owner || asset?.artist?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* {showPdfModal && (
                <Modal handleClose={() => setShowPdfModal(false)}>
                    {asset?.file?.type === "pdf" && asset?.file?.link && (
                        <PDFViewer file={asset.file.link} />
                    )}
                </Modal>
            )} */}
        </main>
    );
};

export default SingleAssetPage;

export async function getStaticPaths() {
    const tokenRes = await fetch(`${API_URL}/tokens?_limit=-1`);
    const tokens = await tokenRes.json();

    return {
        paths: tokens.map((asset) => ({
            params: { slug: asset.slug },
        })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const tokenRes = await fetch(`${API_URL}/tokens?slug=${params.slug}`);
    const tokens = await tokenRes.json();
    const found = tokens[0];
    return {
        props: {
            asset: found,
        },
    };
}
